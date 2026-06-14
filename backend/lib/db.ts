import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Cache the connection across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn;

export async function connectDB() {
  if (cached) return cached;

  cached = await mongoose.connect(MONGODB_URI);
  global._mongooseConn = cached;
  return cached;
}
