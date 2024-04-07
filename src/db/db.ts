/* INFO:
  This connects to the Postal MariaDB database
  
  The DB consists of nested classes:
    - alias
    - endpoint
    - domain
    
  The methods are similar for all, usage:

  db.alias.id(alias) would return the id of an alias.
  db.domain.id(domain) would return the id of an domain.
  etc...
*/

import { Pool } from 'mariadb';
import CONNECTION from './connection';
import { getAliasID, deleteAlias, disableAlias, enableAlias, getAliasStatus, getAllAliases } from './alias.db';
import { getDomainID, getDomainRootID, getDomain, getAllDomains, deleteDomain } from './domain.db';
import { getEndpointID, getEndpointRootID, getAllEndpoints, deleteEndpoint } from './endpoint.db';

class DB {
  private static instance: DB;
  private _pool: any;

  public alias: Alias;
  public domain: Domain;
  public endpoint: Endpoint;

  private constructor(private _serverID: number) {
    this._pool = CONNECTION.getPool(); // this will setup the connection pool
    
    this.alias = new Alias(this._serverID, this._pool);
    this.domain = new Domain(this._serverID,this._pool);
    this.endpoint = new Endpoint(this._serverID, this._pool);
  }

  public static getInstance(serverID: number): DB {
    if (!DB.instance) {
      DB.instance = new DB(serverID);
    }
    return DB.instance;
  }
}

class Alias {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(alias: string): Promise<string | null> {
    return getAliasID(alias, this._pool);
  }

  async all(domain?: string): Promise<string[]> {
    const domainRootID = domain ? await getDomainRootID(domain, this._pool) : undefined;
    return getAllAliases(this._pool, domainRootID);
  }

  async delete(alias: string): Promise<boolean> {
    return deleteAlias(alias, this._pool);
  }

  async status(alias: string): Promise<boolean> {
    return getAliasStatus(alias, this._pool);
  }

  async enable(alias: string, endpoint: string): Promise<boolean> {
    const endpointRootID = await getEndpointRootID(endpoint, this._pool);
    if (!endpointRootID) throw new Error('Endpoint not found');
    return enableAlias(alias, endpointRootID, this._pool);
  }

  async disable(alias: string): Promise<boolean> {
    return disableAlias(alias, this._pool);
  }

  async toggle(alias: string, endpoint: string): Promise<boolean> {
    const enabled = await this.status(alias);
    if (enabled) {
      return disableAlias(alias, this._pool);
    } else {
      const endpointRootID = await getEndpointRootID(endpoint, this._pool);
      if (!endpointRootID) throw new Error('Endpoint not found');
      return enableAlias(alias, endpointRootID, this._pool);
    }
  }
}

class Domain {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(domain: string): Promise<string | null> {
    return getDomainID(domain, this._pool);
  }

  async rootID(domain: string): Promise<string | undefined> {
    return getDomainRootID(domain, this._pool);
  }

  async all(): Promise<string[]> {
    return getAllDomains(this._pool);
  }

  async get(domain: string): Promise<any[]> {
    return getDomain(domain, this._pool);
  }

  async delete(domain: string): Promise<boolean> {
    return deleteDomain(domain, this._pool);
  }
}

class Endpoint {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(endpoint: string): Promise<string | null> {
    return getEndpointID(endpoint, this._pool);
  }

  async rootID(endpoint: string): Promise<string | null> {
    return getEndpointRootID(endpoint, this._pool);
  }

  async all(): Promise<string[]> {
    return getAllEndpoints(this._pool);
  }

  async delete(endpoint: string): Promise<boolean> {
    return deleteEndpoint(endpoint, this._pool);
  }
}

export default DB;
