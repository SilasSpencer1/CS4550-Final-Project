import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memServer: MongoMemoryServer | undefined;

beforeAll(async () => {
  memServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = memServer.getUri();
  process.env.SESSION_SECRET = "test-secret";
  process.env.NODE_ENV = "test";
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name in collections) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
});
