// Utility functions

export class Utils {
  static async wait(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  static decomposeEmail(email: string) {
    const split = email.split('@');
    return {
      username: split[0],
      domain: split[1]
    };
  }

  static getIdFromUrl(url: string, placement: number = 2) {
    const urlObj = new URL(url, 'http://postal.anonacy.com');  // Add dummy base URL to make it a valid URL
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - placement];  // The ID is the second last part of the path
  }
}