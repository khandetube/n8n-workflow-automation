# Architecture and Design Notes

## Data flow
Public market API → HTTP Request → normalization and validation → summary output.

## Reliability choices
- HTTP timeout is configured.
- The request retries transient failures up to three attempts.
- Records with missing asset identifiers or invalid prices are discarded.
- The workflow stops with a clear error if no valid records remain.
- No secrets are stored in the exported JSON.

## Known limitations
- Public API availability and rate limits can change.
- This example does not persist data or send notifications.
- Retry behavior should be reviewed against the API's current terms and rate limits.
- Production use should include an error workflow, monitoring, and retention policies.
