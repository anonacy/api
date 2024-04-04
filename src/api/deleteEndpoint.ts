import type { PuppetInstance } from '../index';
import { findEndpointID } from './findEndpointID';
import RedisInstance from '../redis';
import Utils from '../utils';

// Ran to delete an endpoint
export async function deleteEndpoint(options: {
  puppetInstance: PuppetInstance;
  endpoint: string;
  endpointID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    let endpointID = options.endpointID || '';
    if(!endpointID) {
      endpointID = (await findEndpointID({
        puppetInstance: options.puppetInstance,
        endpoint: options.endpoint
      })).id
    }

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

    // Check if success by seeing if page was redirected
    const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("endpointList")) ? true : false;

    // Delete endpoint from redis
    const redis = RedisInstance.getInstance();
    await redis.delete(`endpoint:${options.endpoint}`);

    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}