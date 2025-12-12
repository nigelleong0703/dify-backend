# Billing / Cloud Plan Touchpoints (Backend)

Scope: api module only. Lists where billing, cloud edition, and plan logic are referenced to gauge blast radius for removal/simplification.

## Config Flags
- `api/configs/feature/__init__.py`: `BillingConfig.BILLING_ENABLED` (mixed into `FeatureConfig`). `dify_config.ENTERPRISE_ENABLED` and `EDITION` gate behaviors in feature_service and decorators.
- `api/configs/feature/hosted_service/__init__.py`: hosted-* configs are adjacent but not billing; keep in mind if removing env keys.

## Core Services
- `api/services/feature_service.py`: When `BILLING_ENABLED`, fetches remote billing info/usage, fills limits, and branches on `CloudPlan.SANDBOX` vs paid. Also retrieves knowledge rate limits. Enterprise path sets copyright/knowledge pipeline.
- `api/services/billing_service.py`: All HTTP calls to billing API (subscription info, feature usage, knowledge rate limit, payment links, invoices, education, compliance download, partner tenant binding, cache clean, account delete/freeze check). Uses env `BILLING_API_URL`, `BILLING_API_SECRET_KEY`.
- `api/services/operation_service.py`: Sends UTM info to billing API (called from decorator).
- `api/services/workflow_service.py`: Uses billing-provided limit info to gate workflow execution paths.

## Decorators & Controllers
- `api/controllers/console/wraps.py`: Billing decorators (`cloud_edition_billing_enabled`, `cloud_edition_billing_resource_check`, `cloud_edition_billing_knowledge_limit_check`, `cloud_edition_billing_rate_limit_check`, `cloud_utm_record`) rely on `FeatureService` and `CloudPlan`.
- `api/controllers/console/billing/billing.py` & `compliance.py`: Billing endpoints (subscription, invoices, partner tenant bindings, compliance download) depend on `BillingService`; registered in `api/controllers/console/__init__.py`.
- `api/controllers/console/workspace/workspace.py`: Returns plan in workspace info when billing enabled; otherwise defaults SANDBOX.
- `api/controllers/service_api/wraps.py`: API-side decorators that block SANDBOX for knowledge ops; rate-limit logging includes subscription plan.
- `api/controllers/web/site.py`, `api/controllers/inner_api/workspace/workspace.py`: Expose tenant plan in site/workspace payloads.

## Quota System
- `api/enums/quota_type.py`: Quota consume/check/refund call billing API when `BILLING_ENABLED`; short-circuits when disabled. Used by workflows/triggers/app generation.
- Call sites: `api/tasks/workflow_schedule_tasks.py`, `api/tasks/trigger_processing_tasks.py`, `api/services/async_workflow_service.py`, `api/services/app_generate_service.py`, `api/services/trigger/webhook_service.py`.

## Dataset / Document Flows
- `api/services/dataset_service.py` and `DocumentService.check_documents_upload_quota`: Limit checks on documents/uploads by plan (SANDBOX caps).
- Tasks: `api/tasks/document_indexing_task.py`, `duplicate_document_indexing_task.py`, `retry_document_indexing_task.py`, `sync_website_document_indexing_task.py` gate or branch on billing/plan.
- Queues: `api/services/document_indexing_proxy/base.py`, `services/rag_pipeline/rag_pipeline_task_proxy.py` choose queue priority by plan (SANDBOX vs paid).

## Account / Auth
- `api/services/account_service.py`: Cleans billing cache on tenant changes; checks `BillingService.is_email_in_freeze`.
- Decorator in `api/controllers/console/wraps.py` uses current tenant features to block when billing disabled.
- `api/controllers/web/error.py`, `api/controllers/console/app/error.py`, `api/controllers/service_api/app/error.py`: Surface provider quota/billing exhaustion errors to clients.

## Scheduling / Cleanup
- `api/schedule/clean_messages.py`, `clean_unused_datasets_task.py`, `mail_clean_document_notify_task.py`: Filter or branch by `CloudPlan.SANDBOX`.

## Enums / Models
- `api/enums/cloud_plan.py`: Plan enum used across feature_service, controllers, tasks, proxies.

## Persistence (DB fields/migrations)
- `api/models/account.py`: `Tenant.plan` column (default "basic") surfaced via workspace/site controllers and drives queue selection/workspace info; plan defaults also asserted in tests.
- `api/models/dataset.py`: `RateLimitLog.subscription_plan` column persists plan when rate limits are hit; related migration `api/migrations/2025_01_14_0617-f051706725cc_add_rate_limit_logs.py`.

## Tenant / Workspace Plumbing
- `api/services/workspace_service.py`: Builds workspace payload including `tenant.plan`; controls logo/branding toggles based on feature flags and roles.
- `api/controllers/web/site.py`, `api/controllers/inner_api/workspace/workspace.py`: Surface tenant plan in site/workspace responses (depends on `Tenant.plan`).
- `api/services/workflow/queue_dispatcher.py`: Chooses dispatcher based on subscription plan.
- `api/commands.py:835` `clear-free-plan-tenant-expired-logs` + `api/services/clear_free_plan_tenant_expired_logs.py`: CLI/cleanup flow keyed on free/SANDBOX tenant plans.

## Tests to Adjust/Remove
- Billing service/controller/decorator tests: `api/tests/unit_tests/services/test_billing_service.py`, `api/tests/unit_tests/controllers/console/billing/test_billing.py`, `api/tests/unit_tests/controllers/console/test_wraps.py`.
- Dataset/document/workflow quota tests that mock billing/plan: `api/tests/unit_tests/tasks/test_dataset_indexing_task.py`, `test_document_indexing_task_proxy.py`, `test_duplicate_document_indexing_task_proxy.py`, `test_rag_pipeline_task_proxy.py`, `test_duplicate_document_indexing_task.py`, `tests/test_containers_integration_tests/...` touching billing mocks.
- Account service tests mocking billing freeze/cache: `api/tests/test_containers_integration_tests/services/test_account_service.py`.
