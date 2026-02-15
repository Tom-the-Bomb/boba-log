import { MongoClient } from "mongodb";

const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }
  return uri;
}

function getDatabaseName() {
  const databaseName = process.env.MONGO_DB_NAME;
  if (!databaseName) {
    throw new Error(
      "Missing MONGODB_DB_NAME (or MONGO_DB_NAME) in environment variables.",
    );
  }
  return databaseName;
}

function getMongoClientPromise() {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(getMongoUri(), options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(getMongoUri(), options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getUsersCollection() {
  const mongoClient = await getMongoClientPromise();
  const databaseName = getDatabaseName();
  return mongoClient.db(databaseName).collection("users");
}
