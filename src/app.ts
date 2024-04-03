import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { postalPuppet } from './index';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json

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

// This is a higher-order function that takes an async function and returns a new function that catches any errors and passes them to next()
// ** It also times the response
function catchErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function(req: Request, res: Response, next: NextFunction) {
    console.time('⏱️ Time to run');
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    } finally {
      console.timeEnd('⏱️ Time to run');
    }
  }
}

app.get('/health', catchErrors( async (req, res) => {
  res.status(200).send({ status: 200 });
}));

app.post('/health', catchErrors( async (req, res) => {
  res.status(201).send({ status: 201 });
}));

app.post('/addAlias', catchErrors( async (req, res) => {
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/deleteAlias', catchErrors( async (req, res) => {
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteAlias({
    puppetInstance,
    alias
  });
  res.status(201).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/deleteEndpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteEndpoint({
    puppetInstance,
    endpoint
  });
  res.status(201).json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/enableAlias', catchErrors( async (req, res) => {
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.enableAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/disableAlias', catchErrors( async (req, res) => {
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.disableAlias({
    puppetInstance,
    alias
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/addEndpoint', catchErrors( async (req, res) => {
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addEndpoint({
    puppetInstance,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/getAliases', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getAliases({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/getAliases', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getEndpoints({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/getDomains', catchErrors( async (req, res) => {
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getDomains({
    puppetInstance
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/addDomain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addDomain({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/checkDomain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.checkDomain({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

app.post('/deleteDomain', catchErrors( async (req, res) => {
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteDomain({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
}));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack); // Log error stack to console
  res.status(500).send({ error: err.message }); // Send error message to client
});

app.listen(port, () => {
  console.log("-------------------------");
  console.log(`Puppet Server is running  at ${process.env.API_DOMAIN}${process.env.NODE_ENV == 'production' ? '' : ':' + port}`);
});
