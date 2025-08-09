# OPNSKIN Web

## Proxies Webshare (Steam)

Env vars à ajouter (Vercel):

- `WEBSHARE_PROXY_URL` (option 1: proxy rotatif, ex: `http://user:pass@proxy.webshare.io:port`)
- `PROXY_POOL` (option 2: liste CSV de proxies `http://user:pass@host:port,...`)
- `PROXY_ROTATION_STRATEGY` (`rotating`|`pool`) – défaut: rotating
- `PROXY_BLOCK_TTL_MS` – TTL de blocage après 403/429 (défaut 600000)
- `PROXY_MAX_RETRIES` – défaut 3
- `PROXY_BACKOFF_BASE_MS` – défaut 500
- `PROXY_REQUEST_MIN_DELAY_MS` – délai min entre requêtes par host (défaut 1100ms)

Les APIs `GET /api/inventory` et lib `lib/inventory-cache.ts` utilisent `fetchWithProxy` avec backoff, rotation, détection de blocages et cache DB.
