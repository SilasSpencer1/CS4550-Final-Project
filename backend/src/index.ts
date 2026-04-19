import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(PORT, () => console.log(`[server] listening on ${PORT}`));
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
