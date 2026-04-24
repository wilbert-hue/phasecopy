import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "phase_xs"

if (!uri && process.env.NODE_ENV === "development") {
  // Only log locally; keep Vercel/build logs clean (add MONGODB_URI in the project for production).
  console.warn("[mongodb] MONGODB_URI is not set. API routes that need the DB will fail until it is configured.")
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri || "mongodb://localhost:27017")
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured")
  const client = await clientPromise
  return client.db(dbName)
}

export default clientPromise
