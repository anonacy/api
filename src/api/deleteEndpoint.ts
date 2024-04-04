import type { PuppetInstance } from '../index';
import DB from '../db/db';
import { Utils } from '../utils';

// Ran to delete an endpoint
export async function deleteEndpoint(options: {
  puppetInstance: PuppetInstance;
  endpoint: string;
  endpointID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    const db = DB.getInstance();
    const endpointID = await db.endpoint.id(options.endpoint);
    if(!endpointID) throw new Error('Endpoint not found');

    // Go to edit alias page
    await options.puppetInstance.page.goto(Utils.urlDictionary("endpointDetail", endpointID));
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

    // check db that endpoint is gone
    const exists = await db.endpoint.id(options.endpoint); // should be null
    if(exists) throw new Error("Endpoint still exists");

    return {
      success: exists ? false : true
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}