import type { PuppetInstance } from '../index';
import { Utils } from '../utils';

// Get a list of all domains
export async function getDomains(options: {
  puppetInstance: PuppetInstance;
}): Promise<{
  success: boolean;
  count: number;
  domains: string[];
}> {

  // Go to new route list
  await options.puppetInstance.page.goto(Utils.urlDictionary('domainList'));
  await options.puppetInstance.page.waitForNetworkIdle();

  // NEXT: Find Domains
  let domains: any[] = [];

  // Next we can show if the domain is setup or not with some parsing:
  const liItems = await options.puppetInstance.page.$$('li.domainList__item');

  for(let liItem of liItems) {
    const { href, innerHTML, dnsChecks } = await options.puppetInstance.page.evaluate(el => {
      const pElement = el.querySelector('p.domainList__name');
      const aElement = pElement?.querySelector('a')
      const liElements = Array.from(el.querySelectorAll('li.domainList__check'));
      let dnsChecks: Record<string, boolean> = {};
      liElements.forEach((liElement, i) => {
        let key: string = ''
        let status: boolean = liElement.classList.contains("domainList__check--ok");
        if(status) {
          // formatted a little different for good and bad status
          key = liElement.innerHTML
        } else {
          // there is a nest "a" tag in the not good statuses:
          const dns_aElement = liElement.querySelector('a');
          if(dns_aElement?.innerHTML) {
            key = dns_aElement.innerHTML
          }
        }
        if(key == "Return Path") key = "RP";
        dnsChecks[key] = status;
      });
      return {
        href: aElement?.getAttribute('href'),
        innerHTML: aElement?.innerHTML,
        dnsChecks
      };
    }, liItem);
        
    // Check if all keys in dnsChecks object are true
    const allKeysTrue = Object.values(dnsChecks).every(value => value === true);

    domains.push({
      domain: innerHTML?.trim(),
      id: Utils.getIdFromUrl(href || ''),
      dns: {
        ...dnsChecks,
        ok: allKeysTrue
      }
    })
  }

  return {
    success: true,
    count: domains.length,
    domains
  };
}