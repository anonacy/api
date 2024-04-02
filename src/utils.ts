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
}