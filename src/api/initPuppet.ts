import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import puppeteer from 'puppeteer';

const runHeadless: boolean = false;
let cookies: any = null;

// Initialize the puppet session by logging into the postal control panel
/*
  INFO:
  - This function initializes a puppeteer browser instance and logs into the postal control panel.
  - The function first checks if there are any cookies saved from a previous session.
  - If the cookies are still valid, the function will use them to log in.
    - The function will check if the cookies are expired by comparing the expiry date with the current date.
    - It will also check that the login page wan't loaded
  - If the cookies are not valid, the function will log in using the provided credentials.
*/
export async function initPuppet(options: {
  postalControlPanel: string;
  postalUrl: string;
  postalUser: string;
  postalPass: string;
}): Promise<{
  puppetInstance: PuppetInstance;
}> {
  try {
    if(cookies) {

      let isExpired = false;

      // check if cookie is expired
      for (const cookie of cookies) {
        if(cookie.name == 'browser_id') {
          if (cookie.expires !== -1 && cookie.expires < Date.now() / 1000) {
            console.log(`Cookie ${cookie.name} is expired.`);
            isExpired = true;
          }
        }
      }
      
      if(!isExpired) {
        // cookies saved and still valid, should already be logged in

        // load homepage using cookies
        const url = `https://${options.postalControlPanel}.${options.postalUrl}`;
        const browser = await puppeteer.launch({
          headless: (process.env.NODE_ENV === 'production' ? true : false) || runHeadless
        });
        const [page] = await browser.pages();
        await page.setCookie(...cookies);
        await page.goto(`${url}/org/anonacy/servers/anonacy`);
        await page.waitForNetworkIdle();

        // last check to make sure we aren't on the login page
        let baseURL = Utils.getBaseURL(await page.url());
        if(!baseURL.includes('login')) {
          return {
            puppetInstance: { browser, page, url } as PuppetInstance
          };
        }
      }
    }


    // No cookies, login
    const url = `https://${options.postalControlPanel}.${options.postalUrl}`;
    const browser = await puppeteer.launch({
      headless: (process.env.NODE_ENV === 'production' ? true : false) || runHeadless
    });
    const [page] = await browser.pages();
    await page.goto(`${url}/login`);
    await page.locator(`[name="email_address"]`).fill(options.postalUser);
    await page.locator('[name="password"]').fill(options.postalPass);
    await page.click('[name="commit"]');
    await page.waitForNetworkIdle();
    cookies = await page.cookies();

    return {
      puppetInstance: { browser, page, url } as PuppetInstance
    };

  } catch (error: any) {
    console.log('Postal: initPuppet Error:', error);
    throw new Error(error);
  }
}
