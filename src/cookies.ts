// Create a singleton class to store cookies
// This class maintains its own global instance

class Cookies {
  private static instance: Cookies;
  private _cookies: any;

  private constructor() {}

  public static getInstance(): Cookies {
    if (!Cookies.instance) {
      Cookies.instance = new Cookies();
    }
    return Cookies.instance;
  }

  get cookies(): any {
    return this._cookies;
  }

  set cookies(value: any) {
    this._cookies = value;
  }
}

export default Cookies;
