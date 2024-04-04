import Redis from 'ioredis';

/* INFO:
  - This file contains the Redis client that is used to interact with the Redis database
  - The purpose of redis is to simply map items to their ID's for quick lookups

  The 4 current items are:
    - domains
    - endpoints
    - aliases
    - webhooks

  format is "type:item" : "ID"

  examples:
  "alias:test@test.anonacy.com" : "aliasID"
  "domain:anonacy.com" : "domainID"

  The api is intended to use the items, not the IDs. The Postal server uses IDs.
  ID's will need to be stored when the item is created.
*/

class RedisInstance {
  private static instance: RedisInstance;
  private _redis: any;

  private constructor() {
    // Add this option to ignore things like vpn ips being blocked by the redis server, probably not needed in prod from heroku
    const redisOptions = { tls: { rejectUnauthorized: false } }

    // Create redis client
    // REDIS_URL is a redis server url in the form:
    // redis://<username>:<password>@<host>:<port>
    this._redis = new Redis(process.env.REDIS_URL || '', redisOptions);
  }

  public static getInstance(): RedisInstance {
    if (!RedisInstance.instance) {
      RedisInstance.instance = new RedisInstance();
    }
    return RedisInstance.instance;
  }

  async set(key: string, value: string): Promise<void> {
    return await this._redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    // returns null if key doesn't exist
    return await this._redis.get(key);
  }

  async delete(key: string): Promise<void> {
    return await this._redis.del(key);
  }
}

export default RedisInstance;