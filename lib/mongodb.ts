import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getUsersCollection() {
  const mongoClient = await clientPromise;
  const databaseName = process.env.MONGODB_DB_NAME!;
  return mongoClient.db(databaseName).collection("users");
}
