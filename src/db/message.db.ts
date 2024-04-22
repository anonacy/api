import mariadb, { Pool } from 'mariadb';

class Message {
  constructor(private _serverID: number) {}

  async all() {
    // new pool need to be created for every messages query, because it is tied to the database
    const DATABASE = `postal-server-${this._serverID}`
    const pool = mariadb.createPool({
      host: process.env.MARIADB_HOST || '127.0.0.1',
      port: Number(process.env.MARIADB_PORT) || 3306,
      database: DATABASE,
      user: process.env.MARIADB_USER || 'root',
      password: process.env.MARIADB_PASS || '',
      connectionLimit: 5
    });

    const res = await getAllMessages(pool);
    await pool.end()
    return res;
  }
}

async function getAllMessages(pool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT id, scope, rcpt_to, mail_from, status, route_id, domain_id, endpoint_id, endpoint_type, timestamp, last_delivery_attempt, spam, spam_score
      FROM messages
      WHERE scope = 'incoming'
      ORDER BY timestamp DESC
    `);
    return result;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}


export { Message };