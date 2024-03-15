// to be run when a user signs up, to add email to destinations available for forwarding in a route

// TODO: Add a check to see if the email already exists in the address endpoints
import type { PuppetInstance } from '../index';
import { findAddressEndpointID } from './findAddressEndpointID';

const URL_add = "https://postal.anonacy.com/org/anonacy/servers/anonacy/address_endpoints/new";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/address_endpoints";

export async function addAddressEndpoint(options: {
  puppetInstance: PuppetInstance;
  username: string;
  domain: string;
}): Promise<{
  success: boolean;
  email: string;
  id: string;
  error: string;
}> {
  const email = `${options.username}@${options.domain}`;
  console.log("Adding address endpoint for email: ", email);

  await options.puppetInstance.page.goto(URL_add);
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
  let ID_res = await findAddressEndpointID({
    puppetInstance: options.puppetInstance,
    username: options.username,
    domain: options.domain,
    skipLoad: true
  });

  if(ID_res.success) {
    addressEndpointID = ID_res.id;
  }

  const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;
  return {
    success,
    email: email,
    id: addressEndpointID,
    error: ''
  };
}