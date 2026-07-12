# PartsPeddle Knowledge Base

This directory contains the PartsPeddle / VinTrack engineering knowledge base. If you are looking for a specific topic, start here.

---

## Browse by concern

### I want to understand the system

- [Architecture](../ARCHITECTURE.md) — high-level structure and convergence target.
- [Project Map](../PROJECT_MAP.md) — repository table of contents.
- [System of Record](engineering/system-of-record.md)
- [Next.js App Router Architecture](engineering/next-app-router-architecture.md)
- [Backend Modules](engineering/backend-modules.md)

### I want to run, deploy, or recover the system

- [Deployment Runbook](operations/deployment-runbook.md)
- [Disaster Recovery](operations/disaster-recovery.md)
- [Fly.io Infrastructure](operations/flyio-infrastructure.md)
- [Operations Environment Mapping](operations/operations-env-mapping.md)
- [Secret Governance](operations/secret-governance.md)
- [Deployment Observability](operations/deployment-observability.md)

### I want to understand search

- [Search Infrastructure](reference/search/infrastructure.md) — master guide.
- [Search Data Flow](reference/search/data-flow.md)
- [Search Index Contract](reference/search/index-contract.md)
- [Search Source of Truth](reference/search/source-of-truth.md)
- [Search V2 Index Spec](reference/search/v2-index-spec.md)
- [Search Ranking Data Lineage](reference/search/ranking-data-lineage.md)

### I want to understand security

- [Application Security](engineering/security.md)
- [API Security](engineering/api-security.md)
- [Data Access](engineering/data-access.md)
- [RLS Policy Map](engineering/rls-policy-map.md)
- [Route Auth Matrix](engineering/route-auth-matrix.md)
- [Security Manual Checks](engineering/security-manual-checks.md)

### I want to plan or certify a feature

- [Production Readiness Certification](guides/prc.md)
- [Feature Planning Template](product/feature-planning-template.md)
- [PPSC Pre-Promotion Sanitization Certification](guides/ppsc-pre-promotion-sanitization-certification.md)
- [SCGC Integration Plan](guides/scgc-integration-plan.md)

### I want to understand governance

- [Governance Overview](../GOVERNANCE.md)
- [Platform Repository Evolution](../governance/planning/platform-repository-evolution.md)
- [Certified System Changelog](../governance/certification/evidence/certified-system-changelog.md)
- [Certified Systems Impact](../governance/certification/evidence/certified-systems-impact.md)
- [Architecture Decision Records](../governance/decisions/)

---

## Directory index

| Directory                                | Purpose                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| [`engineering/`](engineering/)           | How the system is built: architecture, security, backend, data access.  |
| [`operations/`](operations/)             | How to run, deploy, and recover the system.                             |
| [`product/`](product/)                   | Product plans, feature specs, rollout plans.                            |
| [`reference/`](reference/)               | Technical lookup material, especially search contracts and lineage.     |
| [`guides/`](guides/)                     | Checklists, certifications, integration playbooks, and lessons learned. |
| [`decisions/`](decisions/)               | Index of architecture decision records (ADRs).                          |
| [`onboarding/`](onboarding/)             | New-contributor orientation.                                            |
| [`design-system/`](design-system/)       | PartsPeddle Design System (PPDS).                                       |
| [`notes/`](notes/)                       | Informal notes and scratchpads.                                         |
| [`review-templates/`](review-templates/) | Production-readiness audit templates.                                   |
| [`archive/`](archive/)                   | Historical audits and deprecated documents.                             |

---

_The legacy flat index is preserved at [`INDEX.md`](INDEX.md) for backwards compatibility._
