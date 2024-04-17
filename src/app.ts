import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { postalPuppet } from './index';
import { Utils } from './utils';
import { version } from '../package.json';

// BASE CONFIG ----------------------------------------------------------------
dotenv.config();
const app = express();
const port = process.env.API_PORT || 3001;
app.use(express.json()); // for parsing application/json
app.use(cors());

import DB from './db/db';
import CONNECTION from './db/connection';
const conn = CONNECTION.getInstance();


// FUNCTIONS ------------------------------------------------------------------

// Function to initialize puppet with config
async function initPuppetWithConfig() {
  const { puppetInstance } = await postalPuppet.initPuppet({
    postalControlPanel: process.env.POSTAL_SUBDOMAIN || '',
    postalUrl: process.env.POSTAL_URL || '',
    postalUser: process.env.POSTAL_USER || '',
    postalPass: process.env.POSTAL_PASS || ''
  });
  if (!puppetInstance) throw new Error(`Failed to initialize puppet:`);
  return puppetInstance;
}

// This is a higher-order function that takes an async function and returns a new function that catches any errors and passes them to next()
function catchErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      next(err)
    }
  }
}

// MIDDLEWARE -----------------------------------------------------------------

// Disable caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// Request logging middleware
app.use(Utils.logRequest);

// server variables middleware, check postal api key and assign postal org and server
app.use(async (req, res, next) => {
  if (req.path.startsWith('/docs')) { // docs route bypasses apikey auth
    next();
  } else {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      if(authHeader.split(' ')[0] == 'Bearer') {
        const apiKey = authHeader.split(' ')[1]; // Bearer TOKEN
        if(apiKey) {
          const org = await conn.auth(apiKey);
          if(org) {
            // Set all of these to correctly filter postal. 
            // In puppeteer code, urls need the names. In SQL querys, we need the serverID.
            res.locals.org = org.organization_name; // string
            res.locals.orgID = org.organization_id; // number
            res.locals.server = org.server_name; // string
            res.locals.serverID = org.server_id; // number
            next();
          } else {
            res.status(401).json({ error: 'Unauthorized: API_KEY is invalid' });
          }
        } else {
          res.status(401).json({ error: 'Unauthorized: No API_KEY Provided. Follow the [Authorization: Bearer TOKEN] header scheme' });
        }
      } else {
        res.status(401).json({ error: 'Unauthorized: Authorization header formatted incorrectly. Follow the [Authorization: Bearer TOKEN] header scheme' });
      }
    }else {
      res.status(401).json({ error: 'Unauthorized: No Authorization Header' });
    }
  }
});

// SWAGGER DOCS ---------------------------------------------------------------

import { spec, swaggerUi, options } from './docs/swagger';

app.use("/docs", swaggerUi.serve);
app.get("/docs", 
swaggerUi.setup(spec, options) // docExpansion can be 'none', list', or 'full'
);

// GET ------------------------------------------------------------------------

app.get('/health', catchErrors( async (req, res) => {
  res.status(200).send({ status: 200 });
}));

app.get('/domains', catchErrors( async (req, res) => {
  const db = DB.getInstance(res.locals.serverID);
  const domains = await db.domain.all();
  res.json(domains);
}));

app.get('/endpoints', catchErrors( async (req, res) => {
  const db = DB.getInstance(res.locals.serverID);
  const endpoints = await db.endpoint.all();
  res.status(200).json(endpoints);
}));

app.get('/aliases', catchErrors( async (req, res) => {
  const db = DB.getInstance(res.locals.serverID);
  let domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
  const aliases = await db.alias.all(domain);
  res.status(200).json(aliases);
}));

app.get('/domain', catchErrors( async (req, res) => {
  const { domain } = req.query;
  if (typeof domain !== 'string') {
    res.status(400).send('Invalid domain');
    return;
  }
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.checkDomain({
    puppetInstance,
    domain,
    res
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.get('/auth', catchErrors( async (req, res) => {
  if (res.locals.serverID) {
    let data = {
      org: res.locals.org,
      orgID: res.locals.orgID,
      server: res.locals.server,
      serverID: res.locals.serverID
    }
    res.status(200).json({ success: true, version, ...data })
  } else {
    res.status(401).json({ success: false })
  };
}))

// POST -----------------------------------------------------------------------

app.post('/domain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addDomain({
    puppetInstance,
    domain,
    res
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/endpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addEndpoint({
    puppetInstance,
    endpoint,
    res
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/alias', catchErrors( async (req, res) => {
  const { alias, endpoint } = req.body;
  // check if domain exists
  const { domain } = Utils.decomposeEmail(alias);
  const db = DB.getInstance(res.locals.serverID);
  const domainID = await db.domain.id(domain);
  if(!domainID) {
    res.status(400).send("Domain does not exist");
    return;
  }
  const puppetInstance = await initPuppetWithConfig();
  // check if endpoint exists yet, if not, add it
  const endpointID = await db.endpoint.id(endpoint);
  if(!endpointID) {
    await postalPuppet.addEndpoint({
      puppetInstance,
      endpoint,
      res
    });
  }
  // now add the alias route
  const result = await postalPuppet.addAlias({
    puppetInstance,
    alias,
    endpoint,
    res
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

// PUT ------------------------------------------------------------------------

app.put('/alias', catchErrors( async (req, res) => {
  const { alias, enabled } = req.body;
  let success = false;
  if(enabled == undefined || enabled == null) {
    res.status(400).send("Enable parameter is required");
    return;
  }
  const db = DB.getInstance(res.locals.serverID);
  if(enabled === true) {
    success = await db.alias.enable(alias);
  } else if (enabled === false){
    success = await db.alias.disable(alias);
  } else {
    res.status(400).send("Enable parameter needs to be a boolean");
    return;
  }
  res.status(200).json({success});
}));

// DELETE --------------------------------------------------------------------

app.delete('/domain', catchErrors( async (req, res) => {
  if(process.env.NODE_ENV == 'production'){
    res.status(403).json({success: false, error: "Deleting domains is not allowed"});
    return;
  } else {
    const domain = String(req.query.domain);
    if(!domain) {
      res.status(400).send("domain parameter is required");
      return;
    }
    const db = DB.getInstance(res.locals.serverID);
    const success = await db.domain.delete(domain);
    res.status(200).json({success});
  }
}));

app.delete('/endpoint', catchErrors( async (req, res) => {
  if(process.env.NODE_ENV == 'production'){
    res.status(403).json({success: false, error: "Deleting endpoints is not allowed"});
    return;
  } else {
    const endpoint = String(req.query.endpoint);
    if(!endpoint) {
      res.status(400).send("endpoint parameter is required");
      return;
    }
    const db = DB.getInstance(res.locals.serverID);
    const success = await db.endpoint.delete(endpoint);
    res.status(200).json({success});
  }
}));

app.delete('/alias', catchErrors( async (req, res) => {
  const alias = String(req.query.alias);
  if(!alias) {
    res.status(400).send("alias parameter is required");
    return;
  }
  const db = DB.getInstance(res.locals.serverID);
  const success = await db.alias.delete(alias);
  res.status(200).json({success});
}));

// DONE -------------------------------------------------------------------------

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`Error: ${err.message}`); // Log error stack to console
  res.status(500).send({ error: err.message }); // Send error message to client
});

app.listen(port, () => {
  console.log("-------------------------");
  console.log(`Puppet Server is running  at ${process.env.API_DOMAIN}${process.env.NODE_ENV == 'production' ? '' : ':' + port}`);
});
