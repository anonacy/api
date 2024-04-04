/* INFO:
  - Create a singleton class to store cookies
  - This class maintains its own global instance, can be accessed and set from anywhere
  - These cookies are used to maintain authentication with postal server, so a login isn't needed except for first time after server startup
  ---------------
  usage: 
    import Cookies from './cookies';
    globalCookies = Cookies.getInstance();

    -- get cookies --
    const cookies = globalCookies.cookies;

    -- set cookies --
    globalCookies.cookies = cookies;
*/

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
