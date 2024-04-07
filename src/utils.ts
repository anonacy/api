// Utility functions
import { NextFunction, Request, Response } from 'express';
import type { PuppetInstance } from './index';
import { loginPuppet } from './api/loginPuppet';
import chalk from 'chalk';

/* INFO:
  - This class contains utility functions that are used throughout the project.
  - All functions are static and can be called without instantiating the class.
*/

export class Utils {
  // delays for seconds
  static async wait(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  // Breaks email into username and domain
  static decomposeEmail(email: string) {
    const split = email.split('@');
    return {
      username: split[0],
      domain: split[1]
    };
  }

  // Gets ID from URL if it is in 2nd to last part (optional)
  // example.com/some/route/!ID!/edit
  static getIdFromUrl(url: string, placement: number = 2) {
    const urlObj = new URL(url, 'http://postal.anonacy.com');  // Add dummy base URL to make it a valid URL
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - placement];  // The ID is the second last part of the path
  }

  // Strips params from url (anything after the ?)
  static getBaseURL(fullURL: string) {
    const url = new URL(fullURL);
    const baseUrl = url.origin + url.pathname;
    return baseUrl;
  }

  // Checks if string contains another string
  static urlContains(url: string, search: string) {
    return url.includes(search);
  }

  // Matches URL to regexp pattern (useful for urls with IDs in them)
  static isCorrectUrlPresent(url: string, urlCheckName: string) {
    const URL_PATTERNS: { [key: string]: RegExp } = { 
      "addDomain": /^https:\/\/postal\.anonacy\.com\/org\/anonacy\/servers\/anonacy\/domains\/\w+\/setup$/
    };
    return URL_PATTERNS[urlCheckName].test(url);
  }

  // Returns URL based on action and ID (if needed)
  static urlDictionary(
    action: string, 
    org: string = "anonacy", // optional, postal organization
    server: string = "anonacy", // option, postal mail server (within organization)
    id?: string, // optional, for urls that include ids
  ) {
    const URL_Dict: { [key: string]: string } = {
      "login": `https://postal.anonacy.com/login`,
      "addAlias": `https://postal.anonacy.com/org/${org}/servers/${server}/routes/new`,
      "aliasList": `https://postal.anonacy.com/org/${org}/servers/${server}/routes`,
      "aliasDetail": `https://postal.anonacy.com/org/${org}/servers/${server}/routes/${id}/edit`,
      "addDomain": `https://postal.anonacy.com/org/${org}/servers/${server}/domains/new`,
      "domainList": `https://postal.anonacy.com/org/${org}/servers/${server}/domains`,
      "domainDetail": `https://postal.anonacy.com/org/${org}/servers/${server}/domains/${id}/setup`,
      "addEndpoint": `https://postal.anonacy.com/org/${org}/servers/${server}/address_endpoints/new`,
      "endpointList": `https://postal.anonacy.com/org/${org}/servers/${server}/address_endpoints`,
      "endpointDetail": `https://postal.anonacy.com/org/${org}/servers/${server}/address_endpoints/${id}/edit`
    }

    if(action.toLowerCase().includes("detail") && !id) {
      throw new Error("ID is required for detail actions")
    }

    return URL_Dict[action];
  }

  /* Checks to see if the initial page load redirected to login page
     This would mean puppeteer is not authenticated and needs to login
     In theory, this should never happen, since cookies expiry date is checked in initPuppet
     it is run in every route after the initial page load, as a safety measure */
  static async checkIfLoginPage(puppetInstance: PuppetInstance): Promise<PuppetInstance> {
    let baseURL = Utils.getBaseURL(await puppetInstance.page.url());
    if(baseURL.includes('login')) {
      // if not logged in, log in (this will also save cookies)
      return (await loginPuppet({puppetInstance})).puppetInstance;;
    } else {
      return puppetInstance;
    }
  }

  // Removes new lines (\n) from a string
  static removeNewLines(str: string) {
    return str.replace(/\n/g, "");
  }

  // Takes an object of booleans and makes 0's and '1's, false's and true's
  static numToBool(obj: { [key: string]: boolean }) {
    const newObj: { [key: string]: boolean } = {};
    for (const key in obj) {
      newObj[key] = obj[key] ? true : false;
    }
    return newObj;
  }

  // This formats the server logs, used on every incoming request
  static logRequest(req: Request, res: Response, next: NextFunction) {
    const doNotLog = [
      '/docs/swagger-ui-bundle.js',
      '/docs/swagger-ui-standalone-preset.js',
      '/docs/swagger-ui.css',
      '/docs/swagger-ui-init.js',
      '/docs/favicon-32x32.png'
    ];
    if(doNotLog.includes(req.originalUrl)) return next();

    let color = chalk.white;
    switch (req.method) {
      case 'GET':
        color = chalk.green;
        break;
      case 'POST':
        color = chalk.yellow;
        break;
      case 'PUT':
        color = chalk.magenta;
        break;
      case 'DELETE':
        color = chalk.red;
        break;
    }
    const timestamp = new Date().toLocaleString('en-US', {
      year: '2-digit',
      month: "numeric",
      day: 'numeric',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\s/g, '').replace(/,/g, '|');
    console.log(`[${timestamp}]`+ color(`[${req.method}]`) + chalk.cyan(` ${req.originalUrl}`));
    next();
  }

}