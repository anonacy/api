import { Response } from 'express';

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import DB from '../db/db';

// Ran to create a new alias
export async function addAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string; //email alias
  endpoint: string; //email endpoint (forwardTo email)
  res: Response;
}): Promise<{
  success: boolean;
  alias: string;
  endpoint: string;
  enabled: boolean;
}> {
  const { username, domain } = await Utils.decomposeEmail(options.alias);
  const { org, server, serverID } = options.res.locals; // which postal org and server to use
  const db = DB.getInstance(serverID);
  
  // check if alias already exists
  const exists = await db.alias.exists(options.alias);
  if(exists) throw new Error('Alias already exists');

  // Get Endpoint ID
  const endpointID = await db.endpoint.id(options.endpoint);
  
  // Go to new route page
  await options.puppetInstance.page.goto(Utils.urlDictionary('addAlias', org, server));
  await options.puppetInstance.page.waitForNetworkIdle();

  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

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
    `AddressEndpoint#${endpointID}`
  );

  // Submit
  await options.puppetInstance.page.click('[name="commit"]');

  /*
    INFO:
    After clicking submit, there are 2 cases:
      - case 1 (success): The page refreshes and the URL changes to URL_CONFIRM
      - case 2 (error): The page doesn't refresh, and an error message is shown
    To check we watch for both cases, in case either happens with promise.race
  */

  // Set up the promises
  const navigationPromise = options.puppetInstance.page.waitForNavigation();
  const errorMessagePromise = options.puppetInstance.page.waitForSelector('.formErrors');

  // Race the promises
  await Promise.race([navigationPromise, errorMessagePromise]);

  // Check the current page URL
  const url = await options.puppetInstance.page.url();
  if (url !== Utils.urlDictionary('aliasList', org, server)) {
    // This case means the page didn't refresh, there should be an error message
    const errorMessageElement = await options.puppetInstance.page.$('.formErrors');
    if (errorMessageElement) {
      // The error message promise resolved first, an error message showed up
      const errorMessage = await options.puppetInstance.page.evaluate(el => el.textContent, errorMessageElement);
      throw new Error(errorMessage ? errorMessage : 'An error occurred');
    }
  }

  // Final, check db to make sure alias exists
  const aliasID = await db.alias.id(options.alias);

  return {
    success: aliasID ? true : false,
    alias: options.alias,
    endpoint: options.endpoint,
    enabled: true
  };



}