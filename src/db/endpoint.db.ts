import { Pool } from 'mariadb';

class Endpoint {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(endpoint: string): Promise<string | null> {
    return await getEndpointID(endpoint, this._serverID, this._pool);
  }

  async rootID(endpoint: string): Promise<string | null> {
    return await getEndpointRootID(endpoint, this._serverID, this._pool);
  }

  async exists(endpoint: string): Promise<boolean> {
    let id = await this.id(endpoint);
    return id != null ? true : false;
  }

  async all(): Promise<any[]> {
    return await getAllEndpoints(this._serverID, this._pool);
  }

  async delete(endpoint: string): Promise<boolean> {
    return await deleteEndpoint(endpoint, this._serverID, this._pool);
  }
}

async function getEndpointID(endpoint: string, serverID: number, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT uuid
      FROM address_endpoints
      WHERE address = ? AND server_id = ?
    `, [endpoint, serverID]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getEndpointRootID(endpoint: string, serverID: number, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT id
      FROM address_endpoints
      WHERE address = ? AND server_id = ?
    `, [endpoint, serverID]);
    return rows[0] ? rows[0].id : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getAllEndpoints(serverID: number, pool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT uuid AS id, address AS endpoint
      FROM address_endpoints
      WHERE server_id = ?
    `, [serverID]);
    return result;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function deleteEndpoint(endpoint: string, serverID: number, pool: Pool): Promise<boolean> {
  const endpointID = await getEndpointID(endpoint, serverID, pool);
  if (!endpointID) throw new Error('Endpoint not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM address_endpoints
      WHERE uuid = ? AND server_id = ?
    `, [endpointID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}


export { Endpoint, getEndpointRootID };