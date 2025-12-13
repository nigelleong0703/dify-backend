# Plan & Enterprise Capability Notes (Backend View)

## Plan Tiers (as implemented)
- `SANDBOX` (free): Blocked from knowledge add-segment; lower workflow/doc queues; billing decorators enforce member/app/vector/document/annotation quotas; knowledge request rate-limit logging records sandbox. Workspace transfer disabled.
- `TEAM` (paid): Treated as paid; mid workflow/doc queue priority; quotas/limits come from billing payload. No hardcoded feature gap vs professional in backend.
- `PROFESSIONAL` (paid): Treated as paid; highest workflow/doc queue priority; quotas/limits driven by billing payload.
- Stored plan on `Tenant.plan`; defaults to `"basic"` (non-enum) which falls back to sandbox semantics unless updated.

## Enterprise Flag (`ENTERPRISE_ENABLED`)
- When true: enables branding config surface, webapp auth/SSO enforcement, plugin manager, disables change-email; auto-enables webapp copyright and knowledge pipeline publish.
- `CAN_REPLACE_LOGO` is separate; must be true (or provided by billing) for custom logos/branding to be exposed.

## Branding / Logo (per-tenant)
- Gated by `FeatureService.can_replace_logo` and billing decorator `cloud_edition_billing_resource_check("workspace_custom")`.
- Flow: `POST /console/api/workspaces/custom-config/webapp-logo/upload` (PNG/SVG) → `POST /console/api/workspaces/custom-config` with `replace_webapp_logo=true` (optional `remove_webapp_brand`). Then workspace/site payloads include `custom_config.replace_webapp_logo` URL. Each workspace (tenant) sets its own.

## How to get “full access” locally (no limits)
- Disable billing: `BILLING_ENABLED=0`, keep `EDITION=SELF_HOSTED`.
- Enable enterprise surfaces: `ENTERPRISE_ENABLED=1`, `CAN_REPLACE_LOGO=1` (plus optional `MODEL_LB_ENABLED=1`, `DATASET_OPERATOR_ENABLED=1`).
- Set tenant plans to paid: ensure `Tenant.plan` is `team` or `professional` (update default before creation or patch existing rows) to avoid sandbox throttles and get top queues.
- Start services per `api/README.md` (middleware via docker-compose, `uv sync --dev`, `uv run flask db upgrade`, `uv run flask run`); start celery workers if exercising async paths.
- For custom logos, still use the upload + config endpoints above; backend won’t emit custom logo URLs without them even if frontend assets are changed.

## Full-Access Local Startup (quick checklist)
1) Middleware: `cd docker && cp middleware.env.example middleware.env && docker compose -f docker-compose.middleware.yaml --profile postgresql --profile weaviate -p dify up -d`
2) Env (`api/.env`):
   - `BILLING_ENABLED=0`
   - `EDITION=SELF_HOSTED`
   - `ENTERPRISE_ENABLED=1`
   - `CAN_REPLACE_LOGO=1` (optional: `MODEL_LB_ENABLED=1`, `DATASET_OPERATOR_ENABLED=1`)
3) Deps + DB (from `api/`): `uv sync --dev`; `uv run flask db upgrade`
4) Run API: `uv run flask run --host 0.0.0.0 --port=5001 --debug`
5) Workers (for async docs/workflows): `uv run celery -A app.celery worker -P threads -c 2 --loglevel INFO -Q dataset,priority_dataset,priority_pipeline,pipeline,mail,ops_trace,app_deletion,plugin,workflow_storage,conversation,workflow,schedule_poller,schedule_executor,triggered_workflow_dispatcher,trigger_refresh_executor`
6) Set tenant plan to paid (`team`/`professional`) to avoid sandbox behavior; do it before tenant creation or patch DB.
7) Custom logo per workspace: `POST /console/api/workspaces/custom-config/webapp-logo/upload` then `POST /console/api/workspaces/custom-config` with `replace_webapp_logo=true` (optional `remove_webapp_brand`).

## Social Login (Google-only)
- Backend env (`api/.env`): `ENABLE_SOCIAL_OAUTH_LOGIN=1`; set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; leave `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` empty.
- Backend behavior: `/console/api/oauth/login/<provider>` accepts only configured providers; with GitHub creds empty, `/oauth/login/github` returns 400 and `/oauth/login/google` redirects properly.
- Frontend visibility: the web app shows buttons based on backend-exposed OAuth providers; ensure a fresh frontend build/read of config. If GitHub still shows, clear any stale frontend env pointing to GitHub and restart the web app so it re-reads backend system features.

## Enterprise Service (external dependency)
- `ENTERPRISE_ENABLED` turns on calls to an external enterprise service for licensing/branding/SSO. The backend hits `<ENTERPRISE_API_URL>/info` (and plugin manager URL if configured); these must be real `http(s)` endpoints with secrets set.
- If you are not running that service locally, set `ENTERPRISE_ENABLED=0` in `api/.env` to avoid httpx “missing protocol” errors from placeholder URLs. Enable only when a reachable enterprise endpoint is available.
- Knowledge pipeline publish: previously auto-enabled when `ENTERPRISE_ENABLED`; now only enabled via billing (`knowledge_pipeline_publish_enabled` in billing response) or by directly setting feature flags elsewhere. With enterprise off and billing off, publish stays disabled by default.
