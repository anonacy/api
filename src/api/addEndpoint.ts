// to be run when a user signs up, to add email to destinations available for forwarding in a route

import { Response } from 'express';
import type { PuppetInstance } from '../index';
import DB from '../db/db';
import { Utils } from '../utils';

// This function adds an email address to the address endpoints, finds and returns the postal id
export async function addEndpoint(options: {
  puppetInstance: PuppetInstance;
  endpoint: string; // email endpoint (forwardTo email)
  res: Response;
}): Promise<{
  success: boolean;
  endpoint: string;
  id: string;
}> {
  const { org, server } = options.res.locals; // which postal org and server to use
  const db = DB.getInstance();

  const endpoint = options.endpoint;
  // const { username, domain } = await Utils.decomposeEmail(endpoint);

  await options.puppetInstance.page.goto(Utils.urlDictionary('addEndpoint', org, server));
  await options.puppetInstance.page.waitForNetworkIdle();
  
  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);


  await options.puppetInstance.page.waitForSelector('input[id="address_endpoint_address"]');
  await options.puppetInstance.page.type('input[id="address_endpoint_address"]', endpoint);
  await options.puppetInstance.page.click('[name="commit"]');
  try {
    await options.puppetInstance.page.waitForNavigation({ timeout: 3000, waitUntil: 'networkidle0' });
  } catch (error) {
    if(await options.puppetInstance.page.$$('div.formErrors')) {
      throw new Error("Email already exists");
    };
  }

  // check db for endpoint
  let endpointID = await db.endpoint.id(endpoint);

  return {
    success: endpointID ? true : false,
    endpoint,
    id: endpointID ? endpointID : ''
  };
}