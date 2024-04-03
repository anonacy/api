import type { PuppetInstance } from '../index';
import { findAliasID } from './findAliasID';

const URL_BASE = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";
const URL_CONFIRM = "https://postal.anonacy.com/org/anonacy/servers/anonacy/routes";

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
    await options.puppetInstance.page.goto(`${URL_BASE}/${aliasID}/edit`);
    await options.puppetInstance.page.waitForNetworkIdle();

    // Set up the dialog event handler
    options.puppetInstance.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Submit
    await options.puppetInstance.page.click('.button.button--danger');
    await options.puppetInstance.page.waitForNavigation();

    const success = (await options.puppetInstance.page.url() == URL_CONFIRM) ? true : false;

    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}