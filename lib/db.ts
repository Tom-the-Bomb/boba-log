import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext();
  return env.DB;
}
