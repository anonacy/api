import DB from '../db/db';

// Ran to re-enable an alias
export async function enableAlias(options: {
  alias: string;
  endpoint: string; //email endpoint (forwardTo email)
}): Promise<{
  success: boolean;
}> {
  const db = DB.getInstance();
  const success = await db.alias.enable(options.alias, options.endpoint);
  return { success };
}