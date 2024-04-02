import type { PuppetInstance } from '../index';

// closes the puppet session
export async function closePuppet(puppetInstance: PuppetInstance) {
  await puppetInstance.browser.close();
}
