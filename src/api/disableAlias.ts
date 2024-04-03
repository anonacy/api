import type { PuppetInstance } from '../index';
import { findAliasID } from './findAliasID';
import { Utils } from '../utils';

const DISABLE_SETTING = 'Hold'; // Can be: Accept, Hold, Bounce, Reject

// Function to disable an alias
export async function disableAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string;
  aliasID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    let aliasID = options.aliasID || '';
    if(!aliasID) {
      aliasID = (await findAliasID({
        puppetInstance: options.puppetInstance,
        alias: options.alias
      })).id
    }

    // Go to edit alias page
    await options.puppetInstance.page.goto(Utils.urlDictionary("aliasDetail", aliasID));
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

    const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("aliasList")) ? true : false;

    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}