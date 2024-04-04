import type { PuppetInstance } from '../index';
import RedisInstance from '../redis';
import Utils from '../utils';

// Get ID of specific endpoint
export async function findEndpointID(options: {
  puppetInstance: PuppetInstance;
  endpoint: string; // email endpoint (forwardTo email)
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  // Check redis first
  const redis = RedisInstance.getInstance();
  let endpointID = (await redis.get(`endpoint:${options.endpoint}`)) || '';
  if(endpointID) {
    // Found in redis, return
    return { success: true, id: endpointID };
  }

  // Go to route list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(Utils.urlDictionary('endpointList'));
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

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
        // ENDPOINT FOUND
        // Extract ID from a href
        const href = await options.puppetInstance.page.evaluate(el => el.getAttribute('href'), pTag);
        if(href){
          endpointID = Utils.getIdFromUrl(href)
        }
      }
    }
  }

  if(endpointID) {
    // Save to redis, since this function is only used when ID wasn't available
    const redis = RedisInstance.getInstance();
    await redis.set(`endpoint:${options.endpoint}`, endpointID);
  } else {
    throw new Error(`Endpoint ${options.endpoint} not found`);
  }

  return {
    success: endpointID != '' ? true : false,
    id: endpointID
  };



}