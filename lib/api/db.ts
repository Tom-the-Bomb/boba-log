import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb(): D1Database {
  const { env } = getCloudflareContext();
  return env.DB;
}
