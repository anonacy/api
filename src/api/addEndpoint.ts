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
  endpoint: string;
  id: string;
}> {
  const endpoint = options.endpoint;
  // const { username, domain } = await Utils.decomposeEmail(endpoint);

  await options.puppetInstance.page.goto(Utils.urlDictionary('addEndpoint'));
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

  let endpointID = '';
  let ID_res = await findEndpointID({
    puppetInstance: options.puppetInstance,
    endpoint,
    skipLoad: true
  });

  if(ID_res.success) {
    endpointID = ID_res.id;
  }

  const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("endpointList")) ? true : false;
  return {
    success,
    endpoint,
    id: endpointID
  };
}