import type { Browser, Page } from 'puppeteer';

import { initPuppet } from './api/initPuppet';
import { closePuppet } from './api/closePuppet';
import { addAddressEndpoint } from './api/addAddressEndpoint';
import { addAlias } from './api/addAlias';
import { findAliasID } from './api/findAliasID';
import { findAddressEndpointID } from './api/findAddressEndpointID';
import { getAliases } from './api/getAliases';
import { getAddressEndpoints } from './api/getAddressEndpoints';
import { disableAlias } from './api/disableAlias';

export type PuppetInstance = {
  browser: Browser;
  page: Page;
  url: string;
};

export const postalPuppet = {
  initPuppet,
  closePuppet,
  addAddressEndpoint,
  addAlias,
  findAliasID,
  findAddressEndpointID,
  getAliases,
  getAddressEndpoints,
  disableAlias
};
