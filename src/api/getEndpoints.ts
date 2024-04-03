import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

type EndpointObject = {
  endpoint: string;
  id: string;
};

// Get a list of all address endpoints
export async function getEndpoints(options: {
  puppetInstance: PuppetInstance;
  domain?: string;
}): Promise<{
  success: boolean;
  count: number;
  endpoints: EndpointObject[];
}> {

  // Go to new route list
  await options.puppetInstance.page.goto(Utils.urlDictionary('endpointList'));
  await options.puppetInstance.page.waitForNetworkIdle();

  // NEXT: Find Aliases
  let endpoints: EndpointObject[] = [];

  // get all a tags from endpoints list
  const aTags = await options.puppetInstance.page.$$('a.endpointList__link');

  for(let aTag of aTags) {
    const { href, endpoint } = await options.puppetInstance.page.evaluate(aElement => {
      const href = aElement?.getAttribute('href')
      const pElement = aElement?.querySelector('p.endpointList__name');
      const endpoint = pElement?.innerHTML;
      return { href, endpoint }
    }, aTag);

    // parse id from href
    const id = Utils.getIdFromUrl(href || '');
    
    // add alias to list (If domain is specified, only add if it matches the domain)
    if (endpoint) {
      const trimmedEndpoint = endpoint.trim();
      if (options.domain) {
        const { domain } = await Utils.decomposeEmail(trimmedEndpoint);
        if (domain !== options.domain) {
          // if domain doesn't match, skip
          continue;
        }
      }
      endpoints.push({
        endpoint: trimmedEndpoint,
        id
      });
    } // end if(endpoint)
  } // end for

  return {
    success: true,
    count: endpoints.length,
    endpoints
  };
}