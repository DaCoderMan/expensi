import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// --- Native client for NextAuth adapter ---
const uri = process.env.MONGODB_URI || '';

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Return a promise that rejects — routes will handle the error
  clientPromise = Promise.reject(new Error('MONGODB_URI is not configured'));
  // Prevent unhandled rejection at startup
  clientPromise.catch(() => {});
} else {
  const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export default clientPromise;

// --- Mongoose connection ---
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

export async function connectDB() {
  if (!uri) throw new Error('MONGODB_URI is not configured');

  if (globalWithMongoose.mongoose?.conn) return globalWithMongoose.mongoose.conn;

  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
  }

  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(uri);
  }

  globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
  return globalWithMongoose.mongoose.conn;
}
