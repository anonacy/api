import type { PuppetInstance } from '../index';
import RedisInstance from '../redis';
import Utils from '../utils';

// Get ID of a specific domain
export async function findDomainID(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  // Check redis first
  const redis = RedisInstance.getInstance();
  let domainID = (await redis.get(`domain:${options.domain}`)) || '';
  if(domainID) {
    // Found in redis, return
    return { success: true, id: domainID };
  }

  // Go to domain list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(Utils.urlDictionary("domainList"));
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

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

  if(domainID) {
    // Save to redis, since this function is only used when ID wasn't available
    const redis = RedisInstance.getInstance();
    await redis.set(`domain:${options.domain}`, domainID);
  } else {
    throw new Error(`Domain ${options.domain} not found`);
  }

  return {
    success: domainID ? true : false,
    id: domainID
  };



}