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

import mariadb, { Pool } from 'mariadb';
import { getAliasID, deleteAlias, disableAlias, enableAlias, getAliasStatus } from './alias.db';
import { getDomainID } from './domain.db';
import { getEndpointID, getEndpointRootID } from './endpoint.db';

class DB {
  private static instance: DB;
  private _pool: any;
  public alias: Alias;
  public domain: Domain;
  public endpoint: Endpoint;

  private constructor() {
    this._pool = mariadb.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'postal',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      connectionLimit: 5
    });
    this.alias = new Alias(this._pool);
    this.domain = new Domain(this._pool);
    this.endpoint = new Endpoint(this._pool);
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }
}

class Alias {
  constructor(private _pool: Pool) {}

  async id(alias: string): Promise<string | null> {
    return getAliasID(alias, this._pool);
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
  constructor(private _pool: Pool) {}

  async id(domain: string): Promise<string | null> {
    return getDomainID(domain, this._pool);
  }
}

class Endpoint {
  constructor(private _pool: Pool) {}

  async id(endpoint: string): Promise<string | null> {
    return getEndpointID(endpoint, this._pool);
  }

  async rootID(endpoint: string): Promise<string | null> {
    return getEndpointRootID(endpoint, this._pool);
  }
}

export default DB;
