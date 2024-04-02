// Ran to create a new alias

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_add = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes/new";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";

const WEBHOOK_ADDRESS = "test@triggertest.anonacy.com";
const WEBHOOK_ADDRESS_ID = "82ae8fb7-1586-4921-852b-fa45a141597e";

// I'm not sure what this is or why is it "1"
const DOMAIN_TO_VALUE: { [key: string]: string } = {
  "postal.anonacy.com": "1"
}

export async function addAliasRoute(options: {
  puppetInstance: PuppetInstance;
  alias: string; //email alias
  endpoint: string; //email endpoint
  endpoint_id: string;
}): Promise<{
  success: boolean;
  alias: string;
  endpoint: string;
}> {
  const { username, domain } = await Utils.decomposeEmail(options.alias);

  console.log("Adding alias {" + username + "@" + domain + "} for endpoint: ", options.endpoint);


  // Go to new route page
  await options.puppetInstance.page.goto(URL_add);
  await options.puppetInstance.page.waitForNetworkIdle();

  await Utils.wait(1);

  // Enter Username
  await options.puppetInstance.page.waitForSelector('input[id="route_name"]');
  await options.puppetInstance.page.type('input[id="route_name"]', username);

  await Utils.wait(1);

  // Select Domain
  console.log("Domain value: ", DOMAIN_TO_VALUE[domain]);
  await options.puppetInstance.page.waitForSelector('select[id="route_domain_id"]');
  await options.puppetInstance.page.select(
    'select[id="route_domain_id"]',
    DOMAIN_TO_VALUE[domain]
  );

  await Utils.wait(1);

  // Select Endpoint Address
  await options.puppetInstance.page.waitForSelector('select[id="route__endpoint"]');
  await options.puppetInstance.page.select(
    'select[id="route__endpoint"]',
    `AddressEndpoint#${options.endpoint_id}`
  );

  await Utils.wait(1);

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