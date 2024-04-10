// to be run when a user signs up, to add email to destinations available for forwarding in a route

import { Response } from 'express';
import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import DB from '../db/db';
import { DNS } from '../types/types';

// This function adds an email address to the address endpoints, finds and returns the postal id
export async function addDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  res: Response;
}): Promise<{
  success: boolean;
  domain: string;
  dns: DNS;
  note: string;
}> {
  const { org, server, serverID } = options.res.locals; // which postal org and server to use
  const db = DB.getInstance(serverID);
  
  // check if domain already exists
  const exists = await db.domain.exists(options.domain);
  if(exists) throw new Error('Domain already exists');

  // open add domain page
  await options.puppetInstance.page.goto(Utils.urlDictionary('addDomain', org, server));
  await options.puppetInstance.page.waitForNetworkIdle();
  
  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

  await options.puppetInstance.page.waitForSelector('input[id="domain_name"]');
  await options.puppetInstance.page.type('input[id="domain_name"]', options.domain);
  await options.puppetInstance.page.click('[name="commit"]');

  const navigationPromise = options.puppetInstance.page.waitForNavigation();
  const errorMessagePromise = options.puppetInstance.page.waitForSelector('.formErrors');

  // Race the promises
  await Promise.race([navigationPromise, errorMessagePromise]);

  // Check the current page URL
  const url = await options.puppetInstance.page.url();
  if(!Utils.urlContains(url, "setup")){
    // This case means the page didn't refresh, there should be an error message
    const errorMessageElement = await options.puppetInstance.page.$('.formErrors');
    if (errorMessageElement) {
      // The error message promise resolved first, an error message showed up
      const errorMessage = await options.puppetInstance.page.evaluate(el => el.textContent, errorMessageElement);
      throw new Error(errorMessage ? errorMessage : 'An error occurred');
    }
  }

  let domainID = await db.domain.id(options.domain);

  return {
    success: domainID ? true : false,
    domain: options.domain,
    dns: { SPF: false, DKIM: false, RP: false, MX: false, ok: false },
    note: "Domain added to system, please use the GET /domain endpoint to setup DNS"
  };
}