# Project Nebula

**Status:** 🟡 In Progress  
**Phase:** Development  
**Started:** 2024-02-12  
**Target Launch:** 2024-08-01  
**Priority:** Medium

---

## Overview

Nebula is an internal developer tooling platform — a unified observability, deployment, and secret management layer built for the engineering team. It removes the dependency on three separate third-party SaaS tools, reducing cost and improving security.

## Team

| Role | Person |
|---|---|
| Tech Lead | [[David Park]] |
| Advisor | [[Alice Chen]] |
| Design Advisor | [[Sarah Kim]] |

## Goals

1. Centralize deployment pipelines (replace Jenkins + GitHub Actions mix)
2. Unified secret management (replace Vault + scattered .env files)
3. Real-time observability dashboard (Prometheus + custom frontend)

## Milestones

- [x] Requirements gathered — 2024-02-20
- [x] Architecture review — 2024-03-22
- [ ] Secret manager MVP — 2024-05-01
- [ ] Deployment pipeline v1 — 2024-06-15
- [ ] Full rollout — 2024-08-01

## Related Meetings

- [[2024-03-22 Nebula Architecture Review]]
- [[2024-03-25 Q2 Planning]]

## Dependencies

- Relies on [[Project Aurora]] auth service for SSO
- Blocked on infra budget approval from leadership (Q2)

## Notes

David proposed an event-sourcing model for the audit log — decision documented in [[Product Decisions]]. [[Alice Chen]] reviewed the Rust component design in the architecture review.
