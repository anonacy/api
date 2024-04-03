// to be run when a user signs up, to add email to destinations available for forwarding in a route

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_add = "https://postal.anonacy.com/org/anonacy/servers/anonacy/domains/new";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/address_endpoints";

// This function adds an email address to the address endpoints, finds and returns the postal id
export async function addDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
}): Promise<{
  success: boolean;
  domain: string;
  id: string;
}> {
  console.log("Adding new domain: ", options.domain);

  await options.puppetInstance.page.goto(URL_add);
  await options.puppetInstance.page.waitForSelector('input[id="domain_name"]');
  await options.puppetInstance.page.type('input[id="domain_name"]', options.domain);
  await options.puppetInstance.page.click('[name="commit"]');
  try {
    await options.puppetInstance.page.waitForNavigation({ timeout: 3000, waitUntil: 'networkidle0' });
  } catch (error) {
    if(await options.puppetInstance.page.$$('div.formErrors')) {
      throw new Error("Domain already added");
    };
  }

  // Check if success domain is loaded
  if(!Utils.urlContains(options.puppetInstance.page.url(), "setup")){
    throw new Error("Failed to add domain");
  }
  let domainID = await Utils.getIdFromUrl(options.puppetInstance.page.url());
  console.log("Domain ID: ", domainID);


  const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;
  return {
    success,
    domain: options.domain,
    id: domainID
  };
}