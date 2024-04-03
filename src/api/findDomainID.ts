import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

const URL_START = "https://postal.anonacy.com/org/anonacy/servers/anonacy/domains";

// Get ID of a specific domain
export async function findDomainID(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  let domainID = '';

  // Go to domain list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(URL_START);
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // NEXT: Find Domain ID

  // get all a tags from endpoints list
  const liItems = await options.puppetInstance.page.$$('li.domainList__item');

  for(let liItem of liItems) {
    const innerHTML = await options.puppetInstance.page.evaluate(el => el.innerHTML, liItem);
  
    // This block gets the domain name from the list
    const aText = await options.puppetInstance.page.evaluate(innerHtml => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(innerHtml, 'text/html');
      const aElement = doc.querySelector('a');
      return aElement ? aElement.innerHTML : null;
    }, innerHTML);
    
    // Check if the list item contains the alias
    if (aText) {
      if(aText.trim() == options.domain) {
        // ALIAS FOUND
        // This block only runs if the domain name matches the domain we are looking for
        // It extracts the href, and then the ID
        const aHref = await options.puppetInstance.page.evaluate(el => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(el, 'text/html');
          const aElement = doc.querySelector('a');
          return aElement ? aElement.getAttribute('href') : null;
        }, innerHTML);
        if(aHref){
          domainID = Utils.getIdFromUrl(aHref)
        }
      }
    }
  }

  const success = domainID ? true : false;
  return {
    success,
    id: domainID
  };



}