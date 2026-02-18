interface CloudflareEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  R2: R2Bucket;
  GENERAL_RATE_LIMIT: RateLimiter;
  AUTH_RATE_LIMIT: RateLimiter;
}
