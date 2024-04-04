// to be run when a user signs up, to add email to destinations available for forwarding in a route

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import DB from '../db/db';

// This function adds an email address to the address endpoints, finds and returns the postal id
export async function addDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
}): Promise<{
  success: boolean;
  domain: string;
  id: string;
  note: string;
}> {
  const db = DB.getInstance();

  await options.puppetInstance.page.goto(Utils.urlDictionary('addDomain'));
  await options.puppetInstance.page.waitForNetworkIdle();
  
  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

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

  let domainID2 = await db.getDomainID(options.domain);

  if(domainID !== domainID2) {
    throw new Error("Domain ID mismatch");
  }

  return {
    success: domainID2 ? true : false,
    domain: options.domain,
    id: domainID,
    note: "Domain added to system, please use the checkDomain endpoint to setup DNS"
  };
}