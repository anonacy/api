import type { PuppetInstance } from '../index';
import DB from '../db/db';

// Ran to delete an alias
export async function deleteAlias(options: {
  puppetInstance: PuppetInstance;
  alias: string;
  aliasID?: string;
}): Promise<{
  success: boolean;
}> {
  try {
    const db = DB.getInstance();
    const success = await db.alias.delete(options.alias);
    return { success };
  } catch (e: any) {
    throw new Error(e.message);
  }

}