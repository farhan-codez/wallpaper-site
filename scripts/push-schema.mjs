import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS Wallpaper (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      desktopUrl TEXT,
      desktopWidth INTEGER NOT NULL DEFAULT 0,
      desktopHeight INTEGER NOT NULL DEFAULT 0,
      mobileUrl TEXT,
      mobileWidth INTEGER NOT NULL DEFAULT 0,
      mobileHeight INTEGER NOT NULL DEFAULT 0,
      downloads INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Schema pushed to Turso successfully");
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
