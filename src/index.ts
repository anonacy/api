import type { Browser, Page } from 'puppeteer';

import { initPuppet } from './api/initPuppet';
import { closePuppet } from './api/closePuppet';
import { addEndpoint } from './api/addEndpoint';
import { addAlias } from './api/addAlias';
import { findAliasID } from './api/findAliasID';
import { findEndpointID } from './api/findEndpointID';
import { getAliases } from './api/getAliases';
import { getEndpoints } from './api/getEndpoints';
import { disableAlias } from './api/disableAlias';
import { enableAlias } from './api/enableAlias';
import { deleteAlias } from './api/deleteAlias';
import { addDomain } from './api/addDomain';
import { findDomainID } from './api/findDomainID';
import { checkDomain } from './api/checkDomain';
import { getDomains } from './api/getDomains';
import { deleteDomain } from './api/deleteDomain';

export type PuppetInstance = {
  browser: Browser;
  page: Page;
  url: string;
};

export const postalPuppet = {
  initPuppet,
  closePuppet,
  addEndpoint,
  addAlias,
  findAliasID,
  findEndpointID,
  getAliases,
  getEndpoints,
  disableAlias,
  enableAlias,
  deleteAlias,
  addDomain,
  findDomainID,
  checkDomain,
  getDomains,
  deleteDomain
};
