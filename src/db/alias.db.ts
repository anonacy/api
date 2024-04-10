import { Utils } from "../utils";
import { Pool } from 'mariadb';
import { getDomainRootID } from './domain.db';
import { getEndpointRootID } from './endpoint.db';

class Alias {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(alias: string): Promise<string | null> {
    return await getAliasID(alias, this._serverID, this._pool);
  }

  async exists(alias: string): Promise<boolean> {
    let id = await this.id(alias);
    return id != null ? true : false;
  }

  async all(domain?: string): Promise<any[]> {
    return await getAllAliases(this._serverID, this._pool, domain);
  }

  async delete(alias: string): Promise<boolean> {
    return await deleteAlias(alias, this._serverID, this._pool);
  }

  async status(alias: string): Promise<boolean> {
    return await getAliasStatus(alias, this._serverID, this._pool);
  }

  async enable(alias: string,): Promise<boolean> {
    return enableAlias(alias, this._serverID, this._pool);
  }

  async disable(alias: string): Promise<boolean> {
    return disableAlias(alias, this._serverID, this._pool);
  }

  async toggle(alias: string): Promise<boolean> {
    const enabled = await this.status(alias);
    if (enabled) {
      return disableAlias(alias, this._serverID, this._pool);
    } else {
      return enableAlias(alias, this._serverID, this._pool);
    }
  }
}


async function getAliasID(alias: string, serverID: number, pool: Pool): Promise<string | null> {
  const { username, domain } = Utils.decomposeEmail(alias);
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
    SELECT routes.uuid
    FROM routes
    JOIN domains ON routes.domain_id = domains.id
    WHERE routes.name = ? AND domains.name = ? AND routes.server_id = ?
  `, [username, domain, serverID]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getAllAliases(serverID: number, pool: Pool, domain?: string): Promise<any[]> {
  const domainRootID = domain ? await getDomainRootID(domain, serverID, pool) : undefined;
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT CONCAT(r.name, '@', d.name) AS alias, e.address AS endpoint, d.name AS domain,
      CASE WHEN r.mode = 'Endpoint' THEN true ELSE false END AS enabled
      FROM routes r
      LEFT JOIN address_endpoints e ON r.endpoint_id = e.id
      LEFT JOIN domains d ON r.domain_id = d.id
      WHERE r.server_id = ?
      ${domainRootID ? ` AND d.id = '${domainRootID}'` : ''}
    `, [serverID]);
    return result;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function deleteAlias(alias: string, serverID: number, pool: Pool): Promise<boolean> {
  const aliasID = await getAliasID(alias, serverID, pool);
  if (!aliasID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM routes
      WHERE uuid = ? AND server_id = ?
    `, [aliasID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function enableAlias(alias: string, serverID: number, pool: Pool): Promise<boolean> {
  const aliasID = await getAliasID(alias, serverID, pool);
  if (!aliasID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      UPDATE routes
      SET mode = 'Endpoint'
      WHERE uuid = ? AND server_id = ?
    `, [aliasID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function disableAlias(alias: string, serverID: number, pool: Pool): Promise<boolean> {
  const aliasID = await getAliasID(alias, serverID, pool);
  if (!aliasID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      UPDATE routes
      SET mode = 'Hold'
      WHERE uuid = ? AND server_id = ?
    `, [aliasID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getAliasStatus(alias: string, serverID: number, pool: Pool): Promise<boolean> {
  const aliasID = await getAliasID(alias, serverID, pool);
  if (!aliasID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT mode
      FROM routes
      WHERE uuid = ? AND server_id = ?
    `, [aliasID, serverID]);
    return result[0].mode === 'Endpoint';
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { Alias };