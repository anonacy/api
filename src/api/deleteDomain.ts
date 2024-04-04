import type { PuppetInstance } from '../index';
import DB from '../db/db';
import { Utils } from '../utils';

// Ran to delete an domain
// WARNING: Don't delete directly in db, it also clears all routes for the domain
// could also write a function to do that
export async function deleteDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  domainID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    const db = DB.getInstance();
    const domainID = await db.getDomainID(options.domain);

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

    // check db that domain is gone
    const exists = await db.getDomainID(options.domain); // should be null
    if(exists) throw new Error("Domain still exists");

    return {
      success: exists ? false : true
    };
    
  } catch (e: any) {
    throw new Error(e.message);
  }

}