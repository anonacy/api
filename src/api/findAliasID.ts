import type { PuppetInstance } from '../index';
import RedisInstance from '../redis';
import Utils from '../utils';

// Get ID of a specific alias
export async function findAliasID(options: {
  puppetInstance: PuppetInstance;
  alias: string;
  skipLoad?: boolean;
}): Promise<{
  success: boolean;
  id: string;
}> {
  // Check redis first
  const redis = RedisInstance.getInstance();
  let aliasID = (await redis.get(`alias:${options.alias}`)) || '';
  if(aliasID) {
    // Found in redis, return
    return { success: true, id: aliasID };
  }

  // Go to route list page
  if(!options.skipLoad) {
    await options.puppetInstance.page.goto(Utils.urlDictionary("aliasList"));
    await options.puppetInstance.page.waitForNetworkIdle();
  }

  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

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
      if(pElementInnerHTML.trim() == options.alias) {
        // ALIAS FOUND
        // Extract ID from a href
        const href = await options.puppetInstance.page.evaluate(el => el.getAttribute('href'), pTag);
        if(href){
          aliasID = Utils.getIdFromUrl(href)
        }
      }
    }
  }

  if(aliasID) {
    // Save to redis, since this function is only used when ID wasn't available
    await redis.set(`alias:${options.alias}`, aliasID);
  } else {
    throw new Error(`Alias ${options.alias} not found`);
  }

  return {
    success: aliasID != '' ? true : false,
    id: aliasID
  };



}