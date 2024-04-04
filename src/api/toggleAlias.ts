import DB from '../db/db';

// Ran to re-enable an alias
export async function toggleAlias(options: {
  alias: string;
  endpoint: string; //email endpoint (forwardTo email)
}): Promise<{
  success: boolean;
}> {
  const db = DB.getInstance();
  const success = await db.alias.toggle(options.alias, options.endpoint);
  return { success };
}