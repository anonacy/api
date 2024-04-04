import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { postalPuppet } from './index';
import { Utils } from './utils';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json()); // for parsing application/json


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


// GET ------------------------------------------------------------------------

app.get('/health', catchErrors( async (req, res) => {
  res.status(200).send({ status: 200 });
}));

app.get('/test', catchErrors( async (req, res) => {
  const puppetInstance = await initPuppetWithConfig();
  console.log("waiting for 20 seconds...");
  await Utils.wait(20);
  console.log("Done waiting, browser should have closed");
  res.status(200).send({ status: 200 });
}));

app.get('/domains', catchErrors( async (req, res) => {
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getDomains({
    puppetInstance
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.get('/endpoints', catchErrors( async (req, res) => {
  let domain;
  if (typeof req.query.domain === 'string') domain = req.query.domain;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getEndpoints({
    puppetInstance,
    domain
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.get('/aliases', catchErrors( async (req, res) => {
  let domain;
  if (typeof req.query.domain === 'string') domain = req.query.domain;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getAliases({
    puppetInstance,
    domain
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.get('/domain/dns', catchErrors( async (req, res) => {
  const { domain } = req.query;
  if (typeof domain !== 'string') {
    res.status(400).send('Invalid domain');
    return;
  }
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.checkDomain({
    puppetInstance,
    domain
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
    domain
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/endpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addEndpoint({
    puppetInstance,
    endpoint
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/alias', catchErrors( async (req, res) => {
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

// PUT ------------------------------------------------------------------------

app.put('/alias/enable', catchErrors( async (req, res) => {
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.enableAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.put('/alias/disable', catchErrors( async (req, res) => {
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.disableAlias({
    puppetInstance,
    alias
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

// DELETE --------------------------------------------------------------------

app.delete('/domain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteDomain({
    puppetInstance,
    domain
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.delete('/endpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteEndpoint({
    puppetInstance,
    endpoint
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.delete('/alias', catchErrors( async (req, res) => {
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteAlias({
    puppetInstance,
    alias
  });
  res.status(200).json(result);
  await postalPuppet.closePuppet(puppetInstance);
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
