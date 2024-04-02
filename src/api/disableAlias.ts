// Ran to create a new alias

import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import { findAliasID } from './findAliasID';

const URL_BASE = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";
const DISABLE_SETTING = 'Reject'; // Can be: Aceept, Hold, Bounce, Reject


export async function disableAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string;
}): Promise<{
  success: boolean;
}> {
  try {
    const aliasID = await findAliasID({
      puppetInstance: options.puppetInstance,
      alias: options.alias
    })

    // Go to new route list
    await options.puppetInstance.page.goto(`${URL_BASE}/${aliasID.id}/edit`);
    await options.puppetInstance.page.waitForNetworkIdle();

    // Set Endpoint Address to Blocking Mode
    /* 
    INFO:
    There a 4 'additional' values in postal: Accept, Hold, Bounce, Reject
      - Accept: Accept message with no endpoint
      - Hold: Accept message and put message in hold queue
      - Bounce: Accept message and immediately send bounce to sender
      - Reject: Do not accept any incoming messages
    To maintain logging, I think either Hold or Bounce is the best option
    */

    await options.puppetInstance.page.waitForSelector('select[id="route__endpoint"]');
    await options.puppetInstance.page.select(
      'select[id="route__endpoint"]',
      DISABLE_SETTING
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