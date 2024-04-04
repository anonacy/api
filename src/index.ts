import type { Browser, Page } from 'puppeteer';

import { initPuppet } from './api/initPuppet';
import { loginPuppet } from './api/loginPuppet';
import { closePuppet } from './api/closePuppet';
import { addEndpoint } from './api/addEndpoint';
import { addAlias } from './api/addAlias';
import { getEndpoints } from './api/getEndpoints';
import { disableAlias } from './api/disableAlias';
import { enableAlias } from './api/enableAlias';
import { toggleAlias } from './api/toggleAlias';
import { addDomain } from './api/addDomain';
import { checkDomain } from './api/checkDomain';
import { getDomains } from './api/getDomains';

export type PuppetInstance = {
  browser: Browser;
  page: Page;
  url: string;
};

export const postalPuppet = {
  initPuppet,
  loginPuppet,
  closePuppet,
  addEndpoint,
  addAlias,
  getEndpoints,
  disableAlias,
  enableAlias,
  toggleAlias,
  addDomain,
  checkDomain,
  getDomains
};
