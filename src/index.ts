import type { Browser, Page } from 'puppeteer';

import { initPuppet } from './api/initPuppet';
import { closePuppet } from './api/closePuppet';
import { addAddressEndpoint } from './api/addAddressEndpoint';
import { addAliasRoute } from './api/addAliasRoute';
import { findAliasID } from './api/findAliasID';
import { findAddressEndpointID } from './api/findAddressEndpointID';
import { getAliases } from './api/getAliases';
import { getAddressEndpoints } from './api/getAddressEndpoints';

export type PuppetInstance = {
  browser: Browser;
  page: Page;
  url: string;
};

export const postalPuppet = {
  initPuppet,
  closePuppet,
  addAddressEndpoint,
  addAliasRoute,
  findAliasID,
  findAddressEndpointID,
  getAliases,
  getAddressEndpoints
};
