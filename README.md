# n8n Workflow Automation Portfolio

A portfolio-ready n8n automation example demonstrating API ingestion, data normalization, validation, duplicate handling, and a clear testing and handover plan.

> **Status:** Workflow JSON and documentation are prepared for import and testing. It has not yet been verified in a live n8n instance. Do not present it as production-tested until you run the test plan.

## Project: Crypto Market Snapshot Automation

### What it demonstrates
- A manual workflow trigger for controlled testing
- A schedule trigger configured to run every 15 minutes after you activate the imported workflow
- HTTP Request integration with a public market-data API
- JavaScript data normalization and validation
- Handling of missing or invalid values
- A structured output suitable for downstream storage or notifications
- Retry settings and practical test documentation

### Workflow
1. **Manual Trigger** — run on demand while testing.
2. **Schedule Every 15 Minutes** — periodically starts the workflow after activation; keep it inactive during initial import/testing if you do not want scheduled API requests.
3. **Fetch Market Data** — requests market data for Bitcoin, Ethereum, and Solana from CoinGecko's public API.
3. **Normalize & Validate** — maps the response into a consistent schema and validates key fields.
4. **Build Summary** — creates a concise report with timestamp and normalized assets.

## Import
1. Open your n8n instance.
2. Go to **Workflows**.
3. Choose **Import from File**.
4. Select `workflows/crypto-market-snapshot.json`.
5. Run manually first and inspect each node's output.
6. Review the API response and rate limits before repeated use.

## Expected output
A normalized item for each asset, for example:

```json
{
  "asset": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "price_usd": 65000,
  "market_cap_usd": 1200000000000,
  "change_24h_percent": 1.25,
  "retrieved_at": "2026-01-01T12:00:00.000Z"
}
```

Values are examples only; live values vary.

## Testing checklist
- [ ] Import workflow successfully.
- [ ] Run manually and verify the HTTP response.
- [ ] Confirm each output has `asset`, `price_usd`, and `retrieved_at`.
- [ ] Check behavior if an asset is missing from the API response.
- [ ] Confirm no credentials or secrets are stored in the workflow.
- [ ] Review API rate limits and terms before repeated or scheduled use.
- [ ] Activate the workflow only after manual tests pass; scheduled execution is not active merely because the JSON contains a schedule node.
- [ ] Add error workflow and alerting before production deployment.

## Security and operational notes
- The static dashboard uses a browser-side Content Security Policy to limit network destinations, plus a restrictive Permissions Policy and `no-referrer` policy. GitHub Pages does not let this project configure arbitrary HTTP response headers; for stronger enforcement, serve it behind a host that supports response headers and move inline JavaScript/CSS into separate files.
- The dashboard is read-only: it does not connect wallets, request exchange credentials, or place trades.
- The n8n workflow is exported as inactive and must be imported and manually tested in an actual n8n instance before activation. The GitHub validation job checks JSON structure and static references, not live n8n execution.

## Production hardening ideas
- Add an Error Trigger workflow and alert notification.
- Review retry/backoff behavior for transient HTTP errors.
- Persist snapshots in PostgreSQL or Google Sheets.
- Add idempotency/deduplication before downstream writes.
- Use n8n credentials for private APIs; never hard-code API keys.
- Set an appropriate execution-retention policy.

## Scope and honesty
This is a demonstrator project showing workflow structure and integration thinking. It is not a claim of prior commercial n8n experience or a production-ready trading system.
