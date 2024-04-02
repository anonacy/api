// Ran to create a new alias

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";


// This function will get all the aliases (for a given domain (optional))
// it returns an object with alias, isActive, and endpoint

export async function getAliases(options: {
  puppetInstance: PuppetInstance;
  domain?: string;
}): Promise<{
  success: boolean;
  aliases: string[];
}> {

  // Go to new route list
  await options.puppetInstance.page.goto(URL_START);
  await options.puppetInstance.page.waitForNetworkIdle();


  // NEXT: Find Aliases
  let aliases: any = [];

  // get all a tags from routes list
  const pTags = await options.puppetInstance.page.$$('a.routeList__link');

  for(let pTag of pTags) {
    const innerHTML = await options.puppetInstance.page.evaluate(el => el.innerHTML, pTag);

    // Parse the innerHTML and select the p tag
    const pElementInnerHTML = await options.puppetInstance.page.evaluate(innerHtml => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(innerHtml, 'text/html');
      const pElement = doc.querySelector('p.routeList__name');
      return pElement ? pElement.innerHTML : null;
    }, innerHTML);

    // Check if alias is active or disabled
    /*
    INFO:
    class for active: 
      "routeList__endpoint routeList__endpoint--address_endpoint"
    class for disabled:
      "routeList__endpoint routeList__endpoint--none"
    */

    const forwardToInnerHTML = await options.puppetInstance.page.evaluate(innerHtml => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(innerHtml, 'text/html');
      const pElement = doc.querySelector('p.routeList__endpoint--address_endpoint');
      return pElement ? pElement.innerHTML : null;
    }, innerHTML);


    // add alias to list
    if (pElementInnerHTML) {
      const trimmedEmail = pElementInnerHTML.trim();
      let isActive = false;
      let endpoint = null;
      if (forwardToInnerHTML != null){
        endpoint = forwardToInnerHTML.trim();
        isActive = true;
      }
      const { domain } = await Utils.decomposeEmail(trimmedEmail);
    
      if (!options.domain || domain === options.domain) {
        aliases.push({
          alias: trimmedEmail,
          isActive,
          endpoint
        });
      }
    }
  }

  return {
    success: true,
    aliases
  };
}