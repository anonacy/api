import { Pool } from 'mariadb';

async function getDomainID(domain: string, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT uuid
      FROM domains
      WHERE name = ?
    `, [domain]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getDomainRootID(domain: string, pool: Pool): Promise<string | undefined> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT id
      FROM domains
      WHERE name = ?
    `, [domain]);
    return rows[0] ? rows[0].id : undefined;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getDomain(domain: string, pool: Pool): Promise<any[]> {
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
      WHERE name = ?
    `, [domain]);
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

async function getAllDomains(pool: Pool): Promise<any[]> {
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
    `);

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

async function deleteDomain(domain: string, pool: Pool): Promise<boolean> {
  const domainID = await getDomainID(domain, pool);
  if (!domainID) throw new Error('Domain not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM domains
      WHERE uuid = ?
    `, [domainID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { getDomainID, getDomainRootID, getDomain, getAllDomains, deleteDomain };