// Utility functions

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

  static urlDictionary(
    action: string, 
    id?: string, // optional, for urls that include ids
    org: string = "anonacy", // optional, postal organization
    server: string = "anonacy" // option, postal mail server (within organization)
  ) {
    const URL_Dict: { [key: string]: string } = {
      "addAlias": `https://postal.anonacy.com/org/${org}/servers/${server}/routes/new`,
      "aliasList": `https://postal.anonacy.com/org/${org}/servers/${server}/routes`,
      "aliasDetail": `https://postal.anonacy.com/org/${org}/servers/${server}/routes/${id}/edit`,
      "addDomain": `https://postal.anonacy.com/org/${org}/servers/${server}/domains/new`,
      "domainList": `https://postal.anonacy.com/org/${org}/servers/${server}/domains`,
      "addEndpoint": `https://postal.anonacy.com/org/${org}/servers/${server}/address_endpoints/new`,
      "endpointList": `https://postal.anonacy.com/org/${org}/servers/${server}/address_endpoints`,
    };
    return URL_Dict[action];
  }

}