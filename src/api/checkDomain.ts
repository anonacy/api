// to be run when a user signs up, to add email to destinations available for forwarding in a route

import type { PuppetInstance } from '../index';
import { findDomainID } from './findDomainID';
import { Utils } from '../utils';

const URL_add = "https://postal.anonacy.com/org/anonacy/servers/anonacy/domains/new";
const URL_DOMAIN = "https://postal.anonacy.com/org/anonacy/servers/anonacy/domains/5d903222-b11a-48a9-8863-d1bc7a6c923a/setup"

// This function gets the status details of an added domain
export async function checkDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  domainID?: string;
}): Promise<{
  success: boolean;
  domain: string;
  id: string;
}> {
  console.log("Checking domain status: ", options.domain);

  // get ID if not provided
  let domainID: string = options.domainID || '';
  if(!domainID) {
    domainID = (await findDomainID({
      puppetInstance: options.puppetInstance,
      domain: options.domain,
      skipLoad: false
    })).id;
  }



  // const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;
  const success = false;
  return {
    success,
    domain: options.domain,
    id: domainID
  };
}