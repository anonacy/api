import type { PuppetInstance } from '../index';
import Cookies from '../cookies';

// let cookies: any = null;

// Initialize the puppet session by logging into the postal control panel
/*
  INFO:
  - This function takes an already existing puppet instance and logs it in.
*/
export async function loginPuppet(options: {
  puppetInstance: PuppetInstance;
}): Promise<{
  puppetInstance: PuppetInstance;
}> {
  try {
    const globalCookies = Cookies.getInstance();
    const url = `https://${process.env.POSTAL_CONTROL_PANEL || ''}.${process.env.POSTAL_URL || ''}`;
    await options.puppetInstance.page.goto(`${url}/login`);
    await options.puppetInstance.page.locator(`[name="email_address"]`).fill(process.env.POSTAL_USER || '');
    await options.puppetInstance.page.locator('[name="password"]').fill(process.env.POSTAL_PASS || '');
    await options.puppetInstance.page.click('[name="commit"]');
    await options.puppetInstance.page.waitForNetworkIdle();
    globalCookies.cookies = await options.puppetInstance.page.cookies();
    

    return {
      puppetInstance: options.puppetInstance as PuppetInstance
    };

  } catch (error: any) {
    throw new Error(error);
  }
}
