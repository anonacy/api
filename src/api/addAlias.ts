// Ran to create a new alias

import type { PuppetInstance } from '../index';
import { findAddressEndpointID } from './findAddressEndpointID';
import { Utils } from '../utils';

const URL_ADD_ROUTE = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes/new";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";


export async function addAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string; //email alias
  endpoint: string; //email endpoint (forwardTo email)
}): Promise<{
  success: boolean;
  alias: string;
  endpoint: string;
}> {
  const { username, domain } = await Utils.decomposeEmail(options.alias);

  // Get Endpoint ID
  const addressEndpointID = (await findAddressEndpointID({
    puppetInstance: options.puppetInstance,
    endpoint: options.endpoint,
    skipLoad: false
  })).id;

  console.log(`Adding alias {${username}@${domain}} for endpoint: ${options.endpoint} (${addressEndpointID})`);

  // Go to new route page
  await options.puppetInstance.page.goto(URL_ADD_ROUTE);
  await options.puppetInstance.page.waitForNetworkIdle();

  // Enter Username
  await options.puppetInstance.page.waitForSelector('input[id="route_name"]');
  await options.puppetInstance.page.type('input[id="route_name"]', username);

  // Find domain value in select box
  /*
  INFO:
    - Since, select uses value, we need to find the value for the domain
    - do this by reading the text of select group until domain is found, parse value, and then select value
  */
  const domainValue: string = await options.puppetInstance.page.evaluate((domainName) => {
    const selectElement = document.querySelector('select.routeNameInput__domain');
    if (!selectElement) throw new Error('Select element not found');
    for (const option of Array.from((selectElement as HTMLSelectElement).options)) {
      if (option.text === domainName) {
        return option.value;
      } 
    }
    throw new Error(`Domain name "${domainName}" not found in options`);
  }, domain);

  // Select the domain, using found domain value
  await options.puppetInstance.page.waitForSelector('select[id="route_domain_id"]');
  await options.puppetInstance.page.select(
    'select[id="route_domain_id"]',
    domainValue
  );

  // Select Endpoint Address
  await options.puppetInstance.page.waitForSelector('select[id="route__endpoint"]');
  await options.puppetInstance.page.select(
    'select[id="route__endpoint"]',
    `AddressEndpoint#${addressEndpointID}`
  );

  // Submit
  await options.puppetInstance.page.click('[name="commit"]');
  await options.puppetInstance.page.waitForNavigation();


  const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;
  return {
    success,
    alias: options.alias,
    endpoint: options.endpoint
  };



}