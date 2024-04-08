import { Pool } from 'mariadb';

class Domain {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(domain: string): Promise<string | null> {
    return getDomainID(domain, this._serverID, this._pool);
  }

  async rootID(domain: string): Promise<string | undefined> {
    return getDomainRootID(domain, this._serverID, this._pool);
  }

  async exists(domain: string): Promise<boolean> {
    let id = await this.id(domain);
    return id != null ? true : false;
  }

  async all(): Promise<string[]> {
    return getAllDomains(this._serverID, this._pool);
  }

  async get(domain: string): Promise<any[]> {
    return getDomain(domain, this._serverID, this._pool);
  }

  async delete(domain: string): Promise<boolean> {
    return deleteDomain(domain, this._serverID, this._pool);
  }
}

async function getDomainID(domain: string, serverID: number, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT uuid
      FROM domains
      WHERE name = ? AND owner_id = ?
    `, [domain, serverID]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getDomainRootID(domain: string, serverID: number, pool: Pool): Promise<string | undefined> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT id
      FROM domains
      WHERE name = ? AND owner_id = ?
    `, [domain, serverID]);
    return rows[0] ? rows[0].id : undefined;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getDomain(domain: string, serverID: number, pool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT name AS domain,  uuid AS id,
      IF(spf_status = 'OK', true, false) AS SPF, 
      IF(dkim_status = 'OK', true, false) AS DKIM, 
      IF(return_path_status = 'OK', true, false) AS RP, 
      IF(mx_status = 'OK', true, false) AS MX,
      IF(spf_status = 'OK' AND dkim_status = 'OK' AND return_path_status = 'OK' AND mx_status = 'OK', true, false) AS ok
      FROM domains
      WHERE name = ? AND owner_id = ?
    `, [domain, serverID]);
    const mappedResult = result.map((row: any) => ({
      domain: row.domain,
      id: row.id,
      dns: {
        SPF: row.SPF,
        DKIM: row.DKIM,
        RP: row.RP,
        MX: row.MX,
        ok: row.ok
      }
    }));
    return mappedResult[0];
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getAllDomains(serverID: number, pool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT name AS domain,  uuid AS id,
      IF(spf_status = 'OK', true, false) AS SPF, 
      IF(dkim_status = 'OK', true, false) AS DKIM, 
      IF(return_path_status = 'OK', true, false) AS RP, 
      IF(mx_status = 'OK', true, false) AS MX,
      IF(spf_status = 'OK' AND dkim_status = 'OK' AND return_path_status = 'OK' AND mx_status = 'OK', true, false) AS ok
      FROM domains
      WHERE owner_id = ?
    `, [serverID]);

    // Map over the result to create the dns object
    const mappedResult = result.map((row: any) => ({
      domain: row.domain,
      id: row.id,
      dns: {
        SPF: row.SPF,
        DKIM: row.DKIM,
        RP: row.RP,
        MX: row.MX,
        ok: row.ok
      }
    }));

    return mappedResult;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function deleteDomain(domain: string, serverID: number, pool: Pool): Promise<boolean> {
  const domainID = await getDomainID(domain, serverID, pool);
  if (!domainID) throw new Error('Domain not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM domains
      WHERE uuid = ? AND owner_id = ?
    `, [domainID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { Domain, getDomainRootID };