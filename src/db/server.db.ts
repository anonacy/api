import { Pool } from 'mariadb';

async function checkApiKey(apiKey: string, pool: Pool): Promise<any> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
    SELECT 
      organizations.id AS organization_id, 
      organizations.name AS organization_name, 
      servers.id AS server_id, 
      servers.permalink AS server_permalink, 
      servers.name AS server_name
    FROM credentials
    INNER JOIN servers ON credentials.server_id = servers.id
    INNER JOIN organizations ON servers.organization_id = organizations.id
    WHERE credentials.key = ?
  `, [apiKey]);
    return rows[0] ? rows[0] : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { checkApiKey };