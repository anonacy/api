import DB from '../db/db';

// Function to disable an alias
export async function disableAlias(options: {
  alias: string;
  aliasID?: string;
}): Promise<{
  success: boolean;
}> {
  const db = DB.getInstance();
  const success = await db.alias.disable(options.alias);
  return { success };
}