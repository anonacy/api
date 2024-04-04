import { Pool } from 'mariadb';

async function getEndpointID(endpoint: string, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT uuid
      FROM address_endpoints
      WHERE address = ?
    `, [endpoint]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getEndpointRootID(endpoint: string, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT id
      FROM address_endpoints
      WHERE address = ?
    `, [endpoint]);
    return rows[0] ? rows[0].id : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { getEndpointID, getEndpointRootID };