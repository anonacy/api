import puppeteer from 'puppeteer';
import type { PuppetInstance } from '../index';
import { loginPuppet } from './loginPuppet';
import Cookies from '../cookies';

// Initialize the puppet session by logging into the postal control panel
/*
  INFO:
  - This function initializes a puppeteer browser instance and logs into the postal control panel.
  - The function first checks if there are any cookies saved from a previous session.
  - If the cookies are still valid, the function will use them to log in.
    - The function will check if the cookies are expired by comparing the expiry date with the current date.
    - It will also check that the login page wasn't loaded
  - If the cookies are not valid, the function will log in using the provided credentials.
*/
export async function initPuppet(options: {
  postalSubdomain: string;
  postalUrl: string;
  postalUser: string;
  postalPass: string;
  clearCookies?: boolean;
}): Promise<{
  puppetInstance: PuppetInstance;
}> {
  try {
    // Check if cookies are saved
    const globalCookies = Cookies.getInstance();
    if(globalCookies.cookies && !options.clearCookies) {
      // check if cookie is expired
      let isExpired = false;

      for (const cookie of globalCookies.cookies) {
        if(cookie.name == 'browser_id') {
          if (cookie.expires !== -1 && cookie.expires < Date.now() / 1000) {
            // console.log(`Cookie ${cookie.name} is expired.`);
            isExpired = true;
          }
        }
      }
      
      if(!isExpired) {
        // cookies saved and still valid, should already be logged in
        const url = `https://${options.postalSubdomain}.${options.postalUrl}`;
        const browser = await puppeteer.launch({
          args: ['--no-sandbox'],
          headless: ((process.env.NODE_ENV === 'production' || process.env.RUN_HEADLESS == "TRUE") ? true : false)
        });
        const [page] = await browser.pages();
        await page.setCookie(...globalCookies.cookies);
        return {
          puppetInstance: { browser, page, url } as PuppetInstance
        };
      }
    }


    // No cookies, login
    const url = `https://${options.postalSubdomain}.${options.postalUrl}`;
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: ((process.env.NODE_ENV === 'production' || process.env.RUN_HEADLESS == "TRUE") ? true : false)
    });

    const [page] = await browser.pages();

    const puppetInstance: PuppetInstance = (await loginPuppet({
      puppetInstance: { browser, page, url } as PuppetInstance 
    })).puppetInstance;

    return {
      puppetInstance: puppetInstance
    };

  } catch (error: any) {
    // console.log('Postal: initPuppet Error:', error);
    throw new Error(error);
  }
}
