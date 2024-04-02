// Ran to create a new alias

import type { PuppetInstance } from '../index';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";

function getIdFromUrl(url: string) {
  const urlObj = new URL(url, 'http://postal.anonacy.com');  // Add dummy base URL to make it a valid URL
  const pathParts = urlObj.pathname.split('/');
  return pathParts[pathParts.length - 2];  // The ID is the second last part of the path
}

export async function findAliasID(options: {
  puppetInstance: PuppetInstance;
  alias: string;
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  const alias = options.alias;
  let routeID = '';

  // Go to route list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(URL_START);
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // NEXT: Find Alias ID

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
    
    // Check if the p tag contains the alias
    if (pElementInnerHTML) {
      if(pElementInnerHTML.trim() == alias) {
        // ALIAS FOUND
        // Extract ID from a href
        const href = await options.puppetInstance.page.evaluate(el => el.getAttribute('href'), pTag);
        if(href){
          routeID = getIdFromUrl(href)
        }
      }
    }
  }

  const success = routeID != '' ? true : false;
  if(!success) throw new Error(`Alias ${alias} not found`);
  return {
    success,
    id: routeID
  };



}