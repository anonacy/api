import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/address_endpoints";

// Get a list of all address endpoints
export async function getAddressEndpoints(options: {
  puppetInstance: PuppetInstance;
  domain?: string;
}): Promise<{
  success: boolean;
  endpoints: string[];
}> {

  // Go to new route list
  await options.puppetInstance.page.goto(URL_START);
  await options.puppetInstance.page.waitForNetworkIdle();

  // NEXT: Find Aliases
  let endpoints: string[] = [];

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
    
    // add alias to list
    if (pElementInnerHTML) {
      if(options.domain) {
        const { domain } = await Utils.decomposeEmail(pElementInnerHTML.trim());
        if(domain == options.domain) {
          endpoints.push(pElementInnerHTML.trim());
        }
      } else {
        endpoints.push(pElementInnerHTML.trim());
      }
    }
  }

  return {
    success: true,
    endpoints
  };
}