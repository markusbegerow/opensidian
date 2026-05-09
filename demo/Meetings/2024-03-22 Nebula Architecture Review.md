# 2024-03-22 Nebula Architecture Review

**Date:** 2024-03-22
**Time:** 15:00 - 17:00 CET
**Location:** Berlin HQ - Room Vega
**Project:** [[Project Nebula]]

---

## Attendees

- [[David Park]] (presenter)
- [[Alice Chen]] (reviewer)

## Purpose

Deep-dive into the proposed Nebula architecture before development begins. Focus on the event-sourcing model, secret management design, and the deployment pipeline abstraction layer.

## Architecture Proposal

### Event-Sourcing for Audit Log

[[David Park]] proposed using event sourcing (append-only event store) for the audit log rather than a mutable audit table. Key benefits:
- Full replay capability for debugging
- Tamper-evident log (required for compliance)
- Decoupled consumers (observability, alerting, billing)

[[Alice Chen]] asked about storage growth. David estimated ~2 MB/day at current engineering team size - acceptable. PostgreSQL with JSONB column chosen over Kafka to avoid ops overhead.

Decision: **event-sourcing approach approved**. Documented in [[Product Decisions]].

### Secret Management Design

Two options evaluated:

| Option | Pros | Cons |
|---|---|---|
| Wrap HashiCorp Vault | Battle-tested, rich features | Ops complexity, licensing cost |
| Build minimal custom store | Fits our scale, no licensing | Maintenance burden |

Decision: **Custom minimal store** - encrypted at rest with AES-256, accessed via internal gRPC API. [[Alice Chen]] will review crypto layer before merge.

### Deployment Pipeline

Nebula will wrap existing GitHub Actions workflows with a unified API surface. Engineers interact via a CLI and web UI. Rollback is first-class: every deploy is tagged and reversible in one command.

## Open Questions

- SSO integration depends on [[Project Aurora]] auth service being stable
- Need infra budget sign-off before provisioning dedicated Nebula Postgres instance

## Action Items

| Owner | Action | Due |
|---|---|---|
| [[David Park]] | Write detailed design doc for secret manager | 2024-04-01 |
| [[David Park]] | Open ADR for event-sourcing decision | 2024-03-25 |
| [[Alice Chen]] | Review crypto layer design doc | 2024-04-05 |

## Next Meeting

[[2024-03-25 Q2 Planning]]
