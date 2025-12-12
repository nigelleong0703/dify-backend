# Billing/Plan Review Notes (Backend)

## Current Findings
- `api/models/account.py`: `Tenant.plan` defaults to `"basic"` while the rest of the code expects `CloudPlan` values (`sandbox/team/professional`). New tenants will present an unrecognized plan and fall back to sandbox-like behavior.
- `api/services/feature_service.py`: `_fulfill_params_from_billing_api` assumes billing payload shape; missing keys will 500. `get_features` makes two remote billing calls per request with no caching, so decorators and workspace payloads fan out to billing on every call.
- `api/services/workflow/queue_dispatcher.py`: When billing is disabled it forces the `team` queue, ignoring `Tenant.plan` and bypassing free-tier throttling semantics; with billing on, failures default to sandbox.
- `api/services/billing_service.py`: Uses placeholder defaults for `BILLING_API_URL/SECRET` and no request timeout; a stalled billing endpoint can hang workers.
- `api/services/workspace_service.py`: Uses `assert` for `TenantAccountJoin` (500 on missing join) and invokes billing-driven `FeatureService` just to check branding toggles.

## Logo Replacement Flow (backend-gated)
- Endpoints: `POST /console/api/workspaces/custom-config/webapp-logo/upload` (accepts one PNG/SVG), then `POST /console/api/workspaces/custom-config` with `replace_webapp_logo=true` (optional `remove_webapp_brand`).
- Backend gating: Both routes use `cloud_edition_billing_resource_check("workspace_custom")` and require `FeatureService.can_replace_logo` (`CAN_REPLACE_LOGO` or a paid billing plan). Without these, the backend blocks/hides branding regardless of frontend tweaks.
- Result: When enabled, workspace/site payloads include `custom_config.replace_webapp_logo` pointing to `FILES_URL/files/workspaces/{tenant}/webapp-logo`, which the frontend consumes.

## “Unlimited”/No-Billing Startup Tips
- Run with billing off: set `BILLING_ENABLED=0` (and leave `EDITION=SELF_HOSTED`). Billing decorators and quota checks short-circuit when billing is disabled.
- To avoid sandbox-specific limits, ensure created tenants aren’t `"sandbox"`/`"basic"`; use a paid-like plan value (e.g., `"team"`/`"professional"`) when seeding tenants or adjust the default before creating data.
- Optional env toggles to open features: set `CAN_REPLACE_LOGO=1`, `MODEL_LB_ENABLED=1`, `DATASET_OPERATOR_ENABLED=1`, `EDUCATION_ENABLED=0` (or as desired). Enterprise-only switches still require `ENTERPRISE_ENABLED=1`.
- If you keep billing enabled but want no limits, you’ll need the billing API to return generous quotas (or mock/stub responses). Otherwise, leave billing off for the broadest functionality locally.
