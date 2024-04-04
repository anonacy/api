import type { PuppetInstance } from '../index';
import { findAliasID } from './findAliasID';
import RedisInstance from '../redis';
import Utils from '../utils';

// Ran to delete an alias
export async function deleteAlias(options: {
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

    // Check if on login page (redirected because not authenticated), login if yes
    options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

    // Set up the dialog event handler, this auto clicks the "are you sure" popup
    options.puppetInstance.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Submit
    await options.puppetInstance.page.click('.button.button--danger');
    await options.puppetInstance.page.waitForNavigation();

    // Check if success by seeing if page was redirected
    const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("aliasList")) ? true : false;

    // Delete alias from redis
    const redis = RedisInstance.getInstance();
    await redis.delete(`alias:${options.alias}`);

    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}