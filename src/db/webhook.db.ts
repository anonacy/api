import { Pool } from 'mariadb';

class Webhook {
  constructor(private _serverID: number, private _pool: Pool) {}

  async id(webhook: string): Promise<string | null> {
    return await getWebhookID(webhook, this._serverID, this._pool);
  }

  async rootID(webhook: string): Promise<string | null> {
    return await getWebhookRootID(webhook, this._serverID, this._pool);
  }

  async exists(webhook: string): Promise<boolean> {
    let id = await this.id(webhook);
    return id != null ? true : false;
  }

  async all(): Promise<any[]> {
    return await getAllWebhooks(this._serverID, this._pool);
  }

  async delete(webhook: string): Promise<boolean> {
    return await deleteWebhook(webhook, this._serverID, this._pool);
  }

  async enable(alias: string,): Promise<boolean> {
    return toggleWebhook(alias, true, this._serverID, this._pool);
  }

  async disable(alias: string): Promise<boolean> {
    return toggleWebhook(alias, false, this._serverID, this._pool);
  }
}

async function getWebhookID(webhook: string, serverID: number, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT uuid
      FROM webhooks
      WHERE url = ? AND server_id = ?
    `, [webhook, serverID]);
    return rows[0] ? rows[0].uuid : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getWebhookRootID(webhook: string, serverID: number, pool: Pool): Promise<string | null> {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(`
      SELECT id
      FROM webhooks
      WHERE url = ? AND server_id = ?
    `, [webhook, serverID]);
    return rows[0] ? rows[0].id : null;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function getAllWebhooks(serverID: number, pool: Pool): Promise<any[]> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      SELECT url AS webhook, enabled
      FROM webhooks
      WHERE server_id = ?
    `, [serverID]);
    return result;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function deleteWebhook(webhook: string, serverID: number, pool: Pool): Promise<boolean> {
  const webhookID = await getWebhookID(webhook, serverID, pool);
  if (!webhookID) throw new Error('Webhook not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      DELETE FROM webhooks
      WHERE uuid = ? AND server_id = ?
    `, [webhookID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}

async function toggleWebhook(webhook: string, enabled: boolean, serverID: number, pool: Pool): Promise<boolean> {
  const webhookID = await getWebhookID(webhook, serverID, pool);
  if (!webhookID) throw new Error('Alias not found');
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(`
      UPDATE webhooks
      SET enabled = ?
      WHERE uuid = ? AND server_id = ?
    `, [enabled, webhookID, serverID]);
    return result.affectedRows > 0;
  } catch (err: any) {
    throw new Error(err);
  } finally {
    if (conn) conn.end();
  }
}


export { Webhook, getWebhookRootID };