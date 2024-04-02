import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/address_endpoints";


// Get a list of all address endpoints
export async function findAddressEndpointID(options: {
  puppetInstance: PuppetInstance;
  endpoint: string; // email endpoint (forwardTo email)
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  let addressEndpointID = '';

  // Go to route list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(URL_START);
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // NEXT: Find Alias ID

  // get all a tags from endpoints list
  const pTags = await options.puppetInstance.page.$$('a.endpointList__link');

  for(let pTag of pTags) {
    const innerHTML = await options.puppetInstance.page.evaluate(el => el.innerHTML, pTag);
  
    // Parse the innerHTML and select the p tag
    const pElementInnerHTML = await options.puppetInstance.page.evaluate(innerHtml => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(innerHtml, 'text/html');
      const pElement = doc.querySelector('p.endpointList__name');
      return pElement ? pElement.innerHTML : null;
    }, innerHTML);
    
    // Check if the p tag contains the alias
    if (pElementInnerHTML) {
      if(pElementInnerHTML.trim() == options.endpoint) {
        // ALIAS FOUND
        // Extract ID from a href
        const href = await options.puppetInstance.page.evaluate(el => el.getAttribute('href'), pTag);
        if(href){
          addressEndpointID = Utils.getIdFromUrl(href)
        }
      }
    }
  }

  const success = addressEndpointID != '' ? true : false;
  return {
    success,
    id: addressEndpointID
  };



}