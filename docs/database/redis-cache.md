# Redis product cache

## Current implementation

`backend/utils/productCache.js` implements cache-aside caching for product list and product-detail reads. MongoDB is always the source of truth.

| Item | Current behavior |
| --- | --- |
| Client | `node-redis` configured in `backend/config/redis.js` |
| Keys | `ecommerce:products:list:<query-signature>` and `ecommerce:product:<id>` |
| TTL | `REDIS_PRODUCT_TTL`, default 300 seconds |
| Hit | Parsed Redis JSON is returned with `X-Cache: HIT` |
| Miss | MongoDB is queried, then successful data is cached with `X-Cache: MISS` |
| Invalidation | Create invalidates list keys; update/delete invalidates detail and list keys |
| Failure | Read/write/invalidation errors fall back to MongoDB; API startup is not blocked |

Invalidation scans matching list-key prefixes using `SCAN`, rather than using `KEYS` or flushing the database. Corrupt JSON is treated as a miss and the cache entry is removed best-effort.

## Connection formats

Use a `redis://` URL for a local non-TLS instance and `rediss://` for managed TLS providers. The current client intentionally rejects an Upstash REST `https://` endpoint because node-redis requires the Redis TCP/TLS URL.

```ini
REDIS_URL=redis://127.0.0.1:6379
# or: rediss://default:<password>@<host>:6379
REDIS_PRODUCT_TTL=300
```

## Development checks

With the API running, request a product endpoint twice and inspect `X-Cache`; first read should normally be `MISS`, then `HIT` before expiry. For a local Redis container:

```powershell
redis-cli PING
redis-cli SCAN 0 MATCH "ecommerce:*" COUNT 100
redis-cli TTL "ecommerce:products:list:all"
redis-cli GET "ecommerce:products:list:all"
```

**Observed local test:** functional validation observed a `MISS` followed by a `HIT`. No trustworthy numeric benchmark is recorded here because interactive PowerShell prompts distorted timing. Measure with a non-interactive request tool before quoting latency; cache timings are not production guarantees.
