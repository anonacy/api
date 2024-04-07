/* INFO:
  This connects to the Postal MariaDB database
  It maintains one single connection pool to the db for the server
  The DB instance is created on each request, so that is can be setup with initial values (namely the postal serverID), while not creating a new connection to the db on each request.
*/

import mariadb, { Pool } from 'mariadb';
import { checkApiKey } from './server.db';

class CONNECTION {
  private static instance: CONNECTION;
  public pool: Pool;

  private constructor() {
    this.pool = mariadb.createPool({
      host: process.env.MARIADB_HOST || '127.0.0.1',
      port: Number(process.env.MARIADB_PORT) || 3306,
      database: process.env.MARIADB_NAME || 'postal',
      user: process.env.MARIADB_USER || 'root',
      password: process.env.MARIADB_PASS || 'root',
      connectionLimit: 5
    });
  }

  public static getInstance(): CONNECTION {
    if (!CONNECTION.instance) {
      CONNECTION.instance = new CONNECTION();
    }
    return CONNECTION.instance;
  }

  public static getPool(): Pool {
    if (!CONNECTION.instance) {
      CONNECTION.instance = new CONNECTION();
    }
    return CONNECTION.instance.pool;
  }

  async auth(apiKey: string): Promise<any> {
    return await checkApiKey(apiKey, this.pool);
  }
}
export default CONNECTION;
