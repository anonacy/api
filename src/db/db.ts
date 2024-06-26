/* INFO:
  This connects to the Postal MariaDB database
  
  The DB consists of nested classes:
    - alias
    - endpoint
    - domain
    
  The methods are similar for all, usage:

  db.alias.id(alias) would return the id of an alias.
  db.domain.id(domain) would return the id of an domain.
  etc...
*/

import { Pool } from 'mariadb';
import CONNECTION from './connection';
import { Alias } from './alias.db';
import { Domain } from './domain.db';
import { Endpoint } from './endpoint.db';
import { Webhook } from './webhook.db';
import { Message } from './message.db';

class DB {
  private _pool: Pool;

  public alias: Alias;
  public domain: Domain;
  public endpoint: Endpoint;
  public webhook: Webhook;
  public message: Message;

  private constructor(private _serverID: number) {
    this._pool = CONNECTION.getPool(); // this will setup the connection pool

    this.alias = new Alias(this._serverID, this._pool);
    this.domain = new Domain(this._serverID,this._pool);
    this.endpoint = new Endpoint(this._serverID, this._pool);
    this.webhook = new Webhook(this._serverID, this._pool);
    this.message = new Message(this._serverID, this._pool);
  }

  public static getInstance(serverID: number): DB {
    return new DB(serverID);
  }
}

export default DB;
