// to be run when a user signs up, to add email to destinations available for forwarding in a route

import type { PuppetInstance } from '../index';
import { findEndpointID } from './findEndpointID';
import { Utils } from '../utils';

// This function adds an email address to the address endpoints, finds and returns the postal id
export async function addEndpoint(options: {
  puppetInstance: PuppetInstance;
  endpoint: string; // email endpoint (forwardTo email)
}): Promise<{
  success: boolean;
  email: string;
  id: string;
  error: string;
}> {
  const email = options.endpoint;
  const { username, domain } = await Utils.decomposeEmail(email);
  console.log("Adding address endpoint for email: ", email);

  await options.puppetInstance.page.goto(Utils.urlDictionary('addEndpoint'));
  await options.puppetInstance.page.waitForSelector('input[id="address_endpoint_address"]');
  await options.puppetInstance.page.type('input[id="address_endpoint_address"]', email);
  await options.puppetInstance.page.click('[name="commit"]');
  try {
    await options.puppetInstance.page.waitForNavigation({ timeout: 3000, waitUntil: 'networkidle0' });
  } catch (error) {
    if(await options.puppetInstance.page.$$('div.formErrors')) {
      throw new Error("Email already exists");
    };
  }

  let addressEndpointID = '';
  let ID_res = await findEndpointID({
    puppetInstance: options.puppetInstance,
    endpoint: email,
    skipLoad: true
  });

  if(ID_res.success) {
    addressEndpointID = ID_res.id;
  }

  const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("endpointList")) ? true : false;
  return {
    success,
    email: email,
    id: addressEndpointID,
    error: ''
  };
}