// Ran to create a new alias

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";

export async function getAliases(options: {
  puppetInstance: PuppetInstance;
  domain: string;
}): Promise<{
  success: boolean;
  aliases: string[];
}> {

// Go to new route list
await options.puppetInstance.page.goto(URL_START);
await options.puppetInstance.page.waitForNetworkIdle();


// NEXT: Find Aliases
let aliases: string[] = [];

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

  // add alias to list
  if (pElementInnerHTML) {
    if(options.domain) {
      const { domain } = await Utils.decomposeEmail(pElementInnerHTML.trim());
      if(domain == options.domain) {
        aliases.push(pElementInnerHTML.trim());
      }
    } else {
      aliases.push(pElementInnerHTML.trim());
    }
  }
}

  return {
    success: true,
    aliases: aliases,
  };
}