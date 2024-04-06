import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { postalPuppet } from './index';
import { Utils } from './utils';


// BASE CONFIG ----------------------------------------------------------------
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json()); // for parsing application/json

import DB from './db/db';
const db = DB.getInstance();


// FUNCTIONS ------------------------------------------------------------------

// Function to initialize puppet with config
async function initPuppetWithConfig() {
  const { puppetInstance } = await postalPuppet.initPuppet({
    postalControlPanel: process.env.POSTAL_CONTROL_PANEL || '',
    postalUrl: process.env.POSTAL_URL || '',
    postalUser: process.env.POSTAL_USER || '',
    postalPass: process.env.POSTAL_PASS || ''
  });
  if (!puppetInstance) throw new Error(`Failed to initialize puppet:`);
  return puppetInstance;
}

// Request logging middleware
app.use(Utils.logRequest);

// server variables middleware
// this function will take an api key in if the org is different, and assign it here
app.use((req, res, next) => {
  res.locals.org = "anonacy";
  // res.locals.server = "anonacy";
  res.locals.server = process.env.NODE_ENV == "production" ? "anonacy" : "testing";
  next();
});

// This is a higher-order function that takes an async function and returns a new function that catches any errors and passes them to next()
function catchErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}
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
  const domains = await db.domain.all();
  res.json(domains);
}));

app.get('/endpoints', catchErrors( async (req, res) => {
  const endpoints = await db.endpoint.all();
  res.status(200).json(endpoints);
}));

app.get('/aliases', catchErrors( async (req, res) => {
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
  const { alias, endpoint, enable } = req.body;
  let success = false;
  if(enable == undefined || enable == null) {
    res.status(400).send("Enable parameter is required");
    return;
  }
  if(enable === true) {
    success = await db.alias.enable(alias, endpoint);
  } else if (enable === false){
    success = await db.alias.disable(alias);
  } else {
    res.status(400).send("Enable parameter needs to be a boolean");
    return;
  }
  res.status(200).json({success});
}));

// DELETE --------------------------------------------------------------------

app.delete('/domain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const success = await db.domain.delete(domain);
  res.status(200).json({success});
}));

app.delete('/endpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const success = await db.endpoint.delete(endpoint);
  res.status(200).json({success});
}));

app.delete('/alias', catchErrors( async (req, res) => {
  const { alias } = req.body;
  const success = await db.alias.delete(alias);
  res.status(200).json({success});
}));

// DONE -------------------------------------------------------------------------

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack); // Log error stack to console
  res.status(500).send({ error: err.message }); // Send error message to client
});

const server = app.listen(port, () => {
  console.log("-------------------------");
  console.log(`Puppet Server is running  at ${process.env.API_DOMAIN}${process.env.NODE_ENV == 'production' ? '' : ':' + port}`);
});

/* 
  FIXME:
  This export breaks unbuild. not really sure why.
  It is needed to run self served mocha tests
  Remove it for prod builds for now, Ill fix it later
  In the meantime, just do tests by running localhost server and using URL
*/

// export { app, server };
