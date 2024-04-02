import type { PuppetInstance } from '../index';
import { findAliasID } from './findAliasID';
import { findEndpointID } from './findEndpointID';

const URL_BASE = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";

// Ran to re-enable an alias
export async function enableAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string;
  endpoint: string; //email endpoint (forwardTo email)
}): Promise<{
  success: boolean;
}> {
  try {

    // Get Alias ID
    const aliasID = await findAliasID({
      puppetInstance: options.puppetInstance,
      alias: options.alias
    })

    // Get Endpoint ID
    const addressEndpointID = (await findEndpointID({
      puppetInstance: options.puppetInstance,
      endpoint: options.endpoint,
      skipLoad: false
    })).id;

    // Go to edit alias page
    await options.puppetInstance.page.goto(`${URL_BASE}/${aliasID.id}/edit`);
    await options.puppetInstance.page.waitForNetworkIdle();

    // Set Endpoint Address to Endpoint
   await options.puppetInstance.page.waitForSelector('select[id="route__endpoint"]');
   await options.puppetInstance.page.select(
     'select[id="route__endpoint"]',
     `Endpoint#${addressEndpointID}`
   );

    // Submit
    await options.puppetInstance.page.click('[name="commit"]');
    await options.puppetInstance.page.waitForNavigation();

    const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;

    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}