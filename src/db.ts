/* INFO:
  This connects to the Postal MariaDB database
  ORM is sequelize
*/

import mariadb from 'mariadb';
import { Utils } from './utils';

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

  async getAliasID(alias: string) {
    const { username, domain } = Utils.decomposeEmail(alias);
    let conn;
    try {
      conn = await this._pool.getConnection();
      const rows = await conn.query(`
        SELECT routes.uuid
        FROM routes
        JOIN domains ON routes.domain_id = domains.id
        WHERE routes.name = ? AND domains.name = ?
      `, [username, domain]);
      return rows[0].uuid;
    } catch (err: any) {
      throw new Error(err);
    } finally {
      if (conn) conn.end();
    }
  }

  async getDomainID(domain: string) {
    let conn;
    try {
      conn = await this._pool.getConnection();
      const rows = await conn.query(`
        SELECT uuid
        FROM domains
        WHERE name = ?
      `, [domain]);
      return rows[0].uuid;
    } catch (err: any) {
      throw new Error(err);
    } finally {
      if (conn) conn.end();
    }
  }

  async getEndpointID(endpoint: string) {
    let conn;
    try {
      conn = await this._pool.getConnection();
      const rows = await conn.query(`
        SELECT uuid
        FROM address_endpoints
        WHERE address = ?
      `, [endpoint]);
      return rows[0].uuid;
    } catch (err: any) {
      throw new Error(err);
    } finally {
      if (conn) conn.end();
    }
  }

}

export default DB;
