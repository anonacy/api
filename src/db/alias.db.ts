import { Utils } from "../utils";
import { Pool } from 'mariadb';

async function getAliasID(alias: string, pool: Pool): Promise<string | null> {
  const { username, domain } = Utils.decomposeEmail(alias);
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT routes.uuid
      FROM routes
      JOIN domains ON routes.domain_id = domains.id
      WHERE routes.name = ? AND domains.name = ?
    `, [username, domain]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function deleteAlias(alias: string, pool: Pool): Promise<boolean> {
  const aliasID = await getAliasID(alias, pool);
  if (!aliasID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM routes
      WHERE uuid = ?
    `, [aliasID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

export { getAliasID, deleteAlias };