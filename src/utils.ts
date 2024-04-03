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

}