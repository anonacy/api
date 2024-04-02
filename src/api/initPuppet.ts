import type { PuppetInstance } from '../index';
import { Utils } from '../utils';
import puppeteer from 'puppeteer';

const runHeadless: boolean = false;
let cookies: any = null;

// Initialize the puppet session by logging into the postal control panel
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
      // cookies saved, should already be logged in
      console.log("COOKIES: ", cookies);
      // first try to load homepage, to see if blocked.
      const url = `https://${options.postalControlPanel}.${options.postalUrl}`;
      const browser = await puppeteer.launch({
        headless: (process.env.NODE_ENV === 'production' ? true : false) || runHeadless
      });
      const [page] = await browser.pages();
      await page.setCookie(...cookies);
      await page.goto(`${url}/org/anonacy/servers/anonacy`);

      Utils.wait(5);


      return {
        puppetInstance: { browser, page, url } as PuppetInstance
      };

    } else {
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
    }
  } catch (error: any) {
    console.log('Postal: initPuppet Error:', error);
    throw new Error(error);
  }
}
