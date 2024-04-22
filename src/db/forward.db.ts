import mariadb, { Pool } from 'mariadb';

class Forward {
  constructor(private _serverID: number, private _pool: Pool) {}

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

async function getAllMessages(serverPool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await serverPool.getConnection();
    const result = await conn.query(`
      SELECT id, scope, rcpt_to AS alias, mail_from AS sender, status, route_id, domain_id, endpoint_id, endpoint_type, timestamp, last_delivery_attempt, spam, spam_score
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



// FIXME: Having problems where the endpoint_id in messages doesn't correlate correctly in the postal database.

// async function getAllMessagesAndEndpoints(serverPool: Pool, pool: Pool): Promise<any[]> {
//   let conn;
//   let conn2;
//   try {
//     conn = await serverPool.getConnection();
//     const result = await conn.query(`
//       SELECT id, scope, rcpt_to, mail_from, status, route_id, domain_id, endpoint_id, endpoint_type, timestamp, last_delivery_attempt, spam, spam_score
//       FROM messages
//       WHERE scope = 'incoming'
//       ORDER BY timestamp DESC
//     `);

//     // to attach endpoints, need to query the main postal database
//     // Extract all the endpoint_id values
//     const endpointIds = result
//     .filter((row: any) => typeof row.endpoint_id === 'number' && row.endpoint_id !== null)
//     .map((row: any) => row.endpoint_id);

//     // Form the second query
//     conn2 = await pool.getConnection();
//     const endpoints = await conn2.query(`
//       SELECT address AS endpoint
//       FROM address_endpoints
//       WHERE id IN (?)
//     `, [endpointIds]);

//     const resultWithEndpoints = result.map((row: any) => {
//       const endpointObject = endpoints.find((endpoint: any) => endpoint.id == row.endpoint_id);
//       return {
//         ...row,
//         endpoint: endpointObject ? endpointObject.endpoint : null,
//       };
//     });

//     return resultWithEndpoints;
//   } catch (err: any) {
//     throw new Error(err);
//   } finally {
//     if (conn) conn.end();
//     if (conn2) conn2.end();
//   }
// }


export { Forward };