import { Response } from 'express';
import type { PuppetInstance } from '../index';
import DB from '../db/db';
import { Utils } from '../utils';
import { DNS, DnsRecord } from '../types/types';

// This function gets the dns status details/instructions of an added domain
export async function checkDomain(options: {
  puppetInstance: PuppetInstance;
  domain: string;
  res: Response;
}): Promise<{
  success: boolean;
  ok: boolean;
  setup: DnsRecord[];
  dns: DNS,
  domain: string;
}> {
  const { org, server, serverID } = options.res.locals; // which postal org and server to use

  // check if domain is already setup via db
  const db = DB.getInstance(serverID);
  const domain: any = await db.domain.get(options.domain);
  if(!domain) throw new Error('Domain not found');
  const domainID = domain.id;

  if(domain.dns.ok) {
    const fixedDNS: any =  Utils.numToBool(domain.dns);
    return {
      success: true,
      ok: true,
      setup: [],
      dns: fixedDNS,
      domain: options.domain
    };
  }

  // Go to domain page
  await options.puppetInstance.page.goto(Utils.urlDictionary('domainDetail', org, server, domainID));
  await options.puppetInstance.page.waitForNetworkIdle();

  // Check if on login page (redirected because not authenticated), login if yes
  options.puppetInstance = await Utils.checkIfLoginPage(options.puppetInstance);

  // click refresh button and wait for dns check
  let buttonText = "Check my records are correct";
  await options.puppetInstance.page.$$eval('a.button', (buttons, buttonText) => {
    const button = buttons.find(button => button.innerHTML.includes(buttonText));
    if (button) button.click();
  }, buttonText);
  await options.puppetInstance.page.waitForNetworkIdle();

  // check if on list page
  const isListPage = !(await options.puppetInstance.page.url().includes('setup'));

  // go back to domain page if on list page
  if(isListPage) {
    await options.puppetInstance.page.goto(Utils.urlDictionary('domainDetail', org, server, domainID));
    await options.puppetInstance.page.waitForNetworkIdle();
  }


  // Create domain summary
  /*
  INFO: 4 records to check:
    1. SPF Record
    2. DKIM Record
    3. Return Path
    4. MX Record
  */

  // First, extract the page content html
  const rawPageContentElements = await options.puppetInstance.page.$$('div.pageContent--compact');

  // Remove elements that are not needed (check buttons and labels)
  await Promise.all(rawPageContentElements.map(async element => {
    await options.puppetInstance.page.evaluate(el => {
      el.querySelector('div.u-margin.buttonSet')?.remove(); // INFO: the question mark checks if it exists, like an if statement since it could be null
      el.querySelectorAll('span.label')?.forEach(label => {
        label.remove();
      });
    }, element);
  }));

  // Re query the updated dom (with removed elements)
  const updatedPageContentElements = await options.puppetInstance.page.$$('div.pageContent--compact');

  // Turn entire page element into a html string
  // const pageContentArray = await Promise.all(updatedPageContentElements.map(element => 
  //   options.puppetInstance.page.evaluate(el => el.outerHTML, element)
  // ));
  // const pageContent = Utils.removeNewLines(pageContentArray.join(''));

  // Get workable object of page content
  const pageInnerHtmlList = await options.puppetInstance.page.evaluate(el => {
    const innerHtmlArray: any = [];
    el.querySelectorAll('*')?.forEach((child, i) => {
      // INFO: we remove new lines and bold tags, and trim the innerHTML
      innerHtmlArray.push(child.innerHTML?.replace(/[\r\n]+/g, ' ').replace(/<b>|<\/b>/g, '').trim());
    });
    return innerHtmlArray;
  }, updatedPageContentElements[0]);

  /* INFO:
  In the array of innerHtml, We find all the info we need, now just parse through it
  There are 23 elements:
  example of what is contained in all 23 is at bottom of file:
  Let's go step by step:
  */

  // Uncomment this to log the 23 elements:
  // pageInnerHtmlList.forEach((element: string, index: number) => {
  //   console.log(`${index}: ${element}`);
  // });

  // need to build out this dns array, with the 4 objects:
  let dnsRecords: DnsRecord[] = [];

  // Step 1: SPF Record
  dnsRecords.push({
    title: pageInnerHtmlList[3],
    type: "TXT",
    name: "@",
    content: pageInnerHtmlList[7],
    priority: null,
    label: pageInnerHtmlList[4],
    ok: pageInnerHtmlList[4].includes('Your SPF record looks good'),
    note: pageInnerHtmlList[5]
  });

  // Step 2: DKIM Record
  dnsRecords.push({
    title: pageInnerHtmlList[8],
    type: "TXT",
    name: pageInnerHtmlList[11],
    content: pageInnerHtmlList[12],
    priority: null,
    label: pageInnerHtmlList[9],
    ok: pageInnerHtmlList[9].includes('Your DKIM record looks good'),
    note: pageInnerHtmlList[10]
  });

  // Step 3: Return Path
  dnsRecords.push({
    title: pageInnerHtmlList[13],
    type: pageInnerHtmlList[16],
    name: "psrp",
    content: pageInnerHtmlList[18],
    priority: null,
    label: pageInnerHtmlList[14],
    ok: pageInnerHtmlList[14].includes("Your return path looks good"),
    note: pageInnerHtmlList[15]
  });

  // Step 4: MX Records
  dnsRecords.push({
    title: pageInnerHtmlList[19],
    type: "MX",
    name: "@",
    content: pageInnerHtmlList[23],
    priority: 10,
    label: pageInnerHtmlList[20],
    ok: pageInnerHtmlList[20].includes("Your MX records look like they're good to go"),
    note: "You need to add this MX record to your domain, otherwise routing will not work"
  });
  
  // check if all records are ok
  const ok = dnsRecords.every(record => record.ok);
  const success = true;
  const dnsResult = {
    SPF: dnsRecords[0].ok,
    DKIM: dnsRecords[1].ok,
    RP: dnsRecords[2].ok,
    MX: dnsRecords[3].ok,
    ok
  }

  return {
    success,
    ok,
    setup: dnsRecords,
    dns: dnsResult,
    domain: options.domain
  };
}