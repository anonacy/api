import type { PuppetInstance } from '../index';
import { findDomainID } from './findDomainID';
import RedisInstance from '../redis';
import Utils from '../utils';

// Ran to delete an domain
export async function deleteDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  domainID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    let domainID = options.domainID || '';
    if(!domainID) {
      domainID = (await findDomainID({
        puppetInstance: options.puppetInstance,
        domain: options.domain
      })).id
    }

    // Go to list of domains (no delete button on setup page)
    await options.puppetInstance.page.goto(Utils.urlDictionary("domainList"));
    await options.puppetInstance.page.waitForNetworkIdle();

    // Check if on login page (redirected because not authenticated), login if yes
    options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);
    
    // Set up the dialog event handler, this auto clicks the "are you sure" popup
    options.puppetInstance.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const aItems = await options.puppetInstance.page.$$('a.domainList__delete');

    for(let aItem of aItems) {

      // extract the href from all the delete buttons, it contains the domain id
      const href = await options.puppetInstance.page.evaluate(aElement => {
        return aElement?.getAttribute('href')
      }, aItem);

      // if id is found, click the delete button
      if(Utils.getIdFromUrl(href || '', 1) == domainID) {
        await aItem.click();
      }
    }

    // Submit
    await options.puppetInstance.page.waitForNavigation();

    // Check if success by seeing if page was redirected
    const success = (await options.puppetInstance.page.url() == Utils.urlDictionary("domainList")) ? true : false;

    // Delete domain from redis
    const redis = RedisInstance.getInstance();
    await redis.delete(`domain:${options.domain}`);
    
    return {
      success
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}