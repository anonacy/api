import express from 'express';
import { postalPuppet } from './index';
import { useRuntimeConfig } from './config';

const config = useRuntimeConfig();

const app = express();
const port = 3001;

app.use(express.json()); // for parsing application/json

async function initPuppetWithConfig() {
  const { puppetInstance } = await postalPuppet.initPuppet({
    postalControlPanel: config.postalControlPanel,
    postalUrl: config.postalUrl,
    postalUser: config.postalUser,
    postalPass: config.postalPass
  });
  if (!puppetInstance) throw new Error(`Failed to initialize puppet:`);
  return puppetInstance;
}


app.post('/addAlias', async (req, res) => {
  console.time('⏱️ Time to run');
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/deleteAlias', async (req, res) => {
  console.time('⏱️ Time to run');
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.deleteAlias({
    puppetInstance,
    alias
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/enableAlias', async (req, res) => {
  console.time('⏱️ Time to run');
  const { alias, endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.enableAlias({
    puppetInstance,
    alias,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/disableAlias', async (req, res) => {
  console.time('⏱️ Time to run');
  const { alias } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.disableAlias({
    puppetInstance,
    alias
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/addEndpoint', async (req, res) => {
  console.time('⏱️ Time to run');
  const { endpoint } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.addEndpoint({
    puppetInstance,
    endpoint
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/getAliases', async (req, res) => {
  console.time('⏱️ Time to run');
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getAliases({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.post('/getAliases', async (req, res) => {
  console.time('⏱️ Time to run');
  const { domain } = req.body;
  const puppetInstance = await initPuppetWithConfig();
  const result = await postalPuppet.getEndpoints({
    puppetInstance,
    domain
  });
  res.json(result);
  await postalPuppet.closePuppet(puppetInstance);
  console.timeEnd('⏱️ Time to run');
});

app.listen(port, () => {
  console.log(`[server]: Puppet Server is running at http://localhost:${port}`);
});
