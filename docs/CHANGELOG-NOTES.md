# Change notes

This file captures documentation-era implementation facts, not a substitute for Git history.

## Current documented baseline

- Cookie-based JWT authentication and credentialed CORS are in use.
- Product reads use Redis cache-aside with MongoDB fallback and write invalidation.
- Razorpay provider-order creation and server-side signature verification are in use.
- Product/admin/order functionality has documented correctness/security gaps.

Consult `git log` for commit-level history. Future notable behavior changes should add a dated concise entry here or use release notes.
