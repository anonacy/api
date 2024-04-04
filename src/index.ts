import type { Browser, Page } from 'puppeteer';

import { initPuppet } from './api/initPuppet';
import { loginPuppet } from './api/loginPuppet';
import { closePuppet } from './api/closePuppet';
import { addEndpoint } from './api/addEndpoint';
import { addAlias } from './api/addAlias';
import { addDomain } from './api/addDomain';
import { checkDomain } from './api/checkDomain';

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
  addDomain,
  checkDomain
};
