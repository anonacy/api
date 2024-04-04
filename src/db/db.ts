/* INFO:
  This connects to the Postal MariaDB database
  ORM is sequelize
*/

import mariadb from 'mariadb';
import { getAliasID, deleteAlias } from './alias.db';
import { getDomainID } from './domain.db';
import { getEndpointID } from './endpoint.db';

class DB {
  private static instance: DB;
  private _pool: any;

  private constructor() {
    this._pool = mariadb.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'postal',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      connectionLimit: 5
    });
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  async getAliasID(alias: string): Promise<string | null> {
    return getAliasID(alias, this._pool);
  }

  async deleteAlias(alias: string): Promise<boolean> {
    return deleteAlias(alias, this._pool);
  }

  async getDomainID(domain: string): Promise<string | null> {
    return getDomainID(domain, this._pool);
  }

  async getEndpointID(endpoint: string): Promise<string | null> {
    return getEndpointID(endpoint, this._pool);
  }
}

export default DB;
