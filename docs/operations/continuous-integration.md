# Continuous integration

## Scope

GitHub Actions validates this monorepo on pull requests and pushes to `main`. CI is validation only: it does not deploy, create releases, use deployment tokens, or connect to production infrastructure.

## Workflows

- **Backend CI** runs when `backend/**` or its workflow changes. It installs from `backend/package-lock.json`, then runs the isolated Jest/Supertest suite.
- **Frontend CI** runs when `frontend/**` or its workflow changes. It installs from `frontend/package-lock.json`, runs CRA tests once, then creates the production build.

Both workflows use Node 22, `actions/setup-node` npm caching, `contents: read` permissions, and concurrency cancellation for outdated branch/PR runs.

## Test isolation

Backend CI uses `NODE_ENV=test`, deterministic non-sensitive JWT/Razorpay values, and `mongodb-memory-server`. It does not use MongoDB Atlas, Redis/Upstash, Razorpay, Grafana, or Sentry. The initial mongodb-memory-server run can download a MongoDB binary; the job timeout allows for this one-time setup.

Frontend CI uses `CI=true` and no backend or payment secrets.

## Reproduce locally

```powershell
cd backend
npm ci
npm test

cd ..\frontend
npm ci
npm test -- --watchAll=false
npm run build
```

When CI is consistently green, the next phase is separate frontend/backend deployment with post-deployment smoke checks.
