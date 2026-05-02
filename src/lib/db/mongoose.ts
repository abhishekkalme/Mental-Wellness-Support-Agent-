import mongoose from 'mongoose';

import { config } from '@/config/env';

// Global caching for serverless environments (Next.js)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = config.mongodbUri;
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
