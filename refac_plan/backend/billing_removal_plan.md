# Billing & Plan Logic Removal Plan

This document captures the proposed approach for stripping the hosted billing / plan system from the backend while keeping the community (self-hosted) experience stable.

## Objectives
- Remove reliance on remote billing APIs and plan-specific logic.
- Keep self-hosted deployments simple: no subscription tiers, no enterprise toggles.
- Minimise side effects on unrelated modules (workflows, datasets, Celery queues).

## High-Level Steps
1. **Configuration Layer**
   - Drop `BILLING_ENABLED` (and related env vars) from the config stack or hardcode it to `False`.
   - Remove `BillingConfig` from `FeatureConfig` to prevent future re-enabling.
   - Ensure `ENTERPRISE_ENABLED` remains `False` unless explicitly reintroduced.

2. **FeatureService Simplification**
   - Remove the `BillingService` dependency.
   - Delete `_fulfill_params_from_billing_api` and default `FeatureModel` values to match CE behavior (unlimited members/apps/etc.).
   - Optional: delete `billing`/`subscription` fields if no longer referenced.

3. **Controllers & Decorators**
   - Delete the `cloud_edition_billing_*` decorators and their usage sites (members/apps/documents/etc.).
   - Simplify `/console/features` to rely solely on env defaults (no billing checks, no UTM tracking via billing).

4. **BillingService & OperationService**
   - Remove both modules and all import sites (auth, datasets, quota enforcement, etc.).
   - Replace quota enforcement (`QuotaType`) with no-ops that always allow the request.

5. **Workflow / Queue Logic**
   - Simplify `QueueDispatcherManager` to use a single queue (current TEAM settings) irrespective of plan.
   - Remove plan enums (`CloudPlan`) once no references remain.

6. **Docker / Env Files**
   - Delete `BILLING_*` and `ENTERPRISE_*` keys from `.env.example`, docker compose templates, and documentation.
   - Update `DEVELOPMENT_SETUP.md` to reflect that billing is already removed.

7. **Tests & Docs Cleanup**
   - Remove billing-related tests (`test_billing_service`, decorator tests, etc.).
   - Update docs/README snippets so they no longer mention upgrading plans or billing toggles.

## Validation
- After each major removal, run `make lint` and `make type-check`.
- Execute the existing backend unit suite (`uv run --project api --dev dev/pytest/pytest_unit_tests.sh`) to confirm no accidental regressions.
- Smoke-test core flows (workspace creation, dataset upload, workflow execution) on a self-hosted stack to confirm no plan checks remain.

## Notes
- If any enterprise toggles are still required for your fork, keep them behind a separate configuration flag unrelated to billing.
- Consider stubbing existing API endpoints instead of deleting them immediately if other services (e.g., front-end) expect their presence.
