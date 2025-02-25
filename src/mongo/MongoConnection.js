
import { MongoClient } from "mongodb";

export default class MongoConnection {
  #client;
  #db;
  constructor(connectionStr, dbName) {
    this.#client = new MongoClient(connectionStr);
    this.#db = this.#client.db(dbName);
  }

  async connect() {
    if (!this.#client.topology || !this.#client.topology.isConnected()) {
      await this.#client.connect();
    }
  }

  getCollection(collectionName) {
    return this.#db.collection(collectionName);
  }

  async close() {
    await this.#client.close();
  }
}