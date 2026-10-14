# Test Plan

## Happy path
1. Import the workflow.
2. Execute manually.
3. Confirm up to three normalized assets appear.
4. Confirm each output includes `asset`, `price_usd`, and `retrieved_at`.
5. Confirm the final node contains `summary` and `asset_count`.

## Failure-path checks
- Temporarily change the URL to an invalid endpoint; verify the HTTP node reports failure.
- Use a test response with a missing `current_price`; verify invalid rows are dropped.
- Test an empty response; verify the Code node throws a descriptive error.
- Restore the original URL after testing.

## Acceptance criteria
- Workflow imports without missing credentials.
- Manual execution reaches the final node when the public API is available.
- Output schema is consistent.
- Invalid records are not emitted as valid assets.
- No private API key or credential is embedded in the workflow.
