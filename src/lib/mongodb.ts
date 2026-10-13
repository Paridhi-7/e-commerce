import { MongoClient, type Db } from "mongodb";

declare global {
  var _kartifyMongo:
    | {
        client: MongoClient;
        promise: Promise<MongoClient>;
        dbName: string;
      }
    | undefined;
}

function getMongoConfig() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local");
  }
  return {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB || "kartify",
  };
}

function getSingleton() {
  if (!global._kartifyMongo) {
    const { uri, dbName } = getMongoConfig();
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    const promise = client.connect();
    global._kartifyMongo = { client, promise, dbName };
  }
  return global._kartifyMongo;
}

/** Returns a connected MongoClient instance (cached across dev hot reloads). */
export async function getClient(): Promise<MongoClient> {
  const singleton = getSingleton();
  return singleton.promise;
}

/** Returns the connected MongoDB database instance. */
export async function getDb(): Promise<Db> {
  const singleton = getSingleton();
  const client = await singleton.promise;
  const dbName =
    process.env.MONGODB_DB || singleton.dbName || "kartify";
  return client.db(dbName);
}

export default getDb;
