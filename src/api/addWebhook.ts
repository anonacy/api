// to be run when a user signs up, to add email to destinations available for forwarding in a route

import { Response } from 'express';
import type { PuppetInstance } from '../index';
import DB from '../db/db';
import { Utils } from '../utils';

// This function adds an email address to the address webhooks, finds and returns the postal id
export async function addWebhook(options: {
  puppetInstance: PuppetInstance;
  webhook: string; // webhook url
  res: Response;
}): Promise<{
  success: boolean;
  webhook: string;
}> {
  const { org, server, serverID } = options.res.locals; // which postal org and server to use
  const db = DB.getInstance(serverID);
  
  // check if webhook already exists
  const exists = await db.webhook.exists(options.webhook);
  if(exists) throw new Error('Webhook already exists');

  // open add webhook page
  await options.puppetInstance.page.goto(Utils.urlDictionary('addWebhook', org, server));
  await options.puppetInstance.page.waitForNetworkIdle();
  
  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

  await options.puppetInstance.page.waitForSelector('input[id="webhook_name"]');
  await options.puppetInstance.page.type('input[id="webhook_name"]', `webhook_${Utils.randomString(8)}`);

  await options.puppetInstance.page.waitForSelector('input[id="webhook_url"]');
  await options.puppetInstance.page.type('input[id="webhook_url"]', options.webhook);
  await options.puppetInstance.page.click('[name="commit"]');
  try {
    await options.puppetInstance.page.waitForNavigation({ timeout: 3000, waitUntil: 'networkidle0' });
  } catch (error) {
    if(await options.puppetInstance.page.$$('div.formErrors')) {
      throw new Error("Email already exists");
    };
  }

  // check db for webhook
  let webhookID = await db.webhook.id(options.webhook);

  return {
    success: webhookID ? true : false,
    webhook: options.webhook
  };
}