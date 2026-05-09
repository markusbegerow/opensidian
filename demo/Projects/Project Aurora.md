# Project Aurora

**Status:** 🟢 Active  
**Phase:** Beta  
**Started:** 2024-01-08  
**Target Launch:** 2024-06-30  
**Priority:** High

---

## Overview

Aurora is the company's flagship SaaS product — a collaborative workspace platform aimed at mid-market teams. It replaces three legacy tools and unifies communication, task tracking, and file management in one interface.

## Team

| Role | Person |
|---|---|
| Product Owner | [[Bob Martinez]] |
| Tech Lead | [[Alice Chen]] |
| Backend Lead | [[David Park]] |
| Lead Designer | [[Sarah Kim]] |
| QA Lead | [[Emma Wilson]] |
|GvD | [[Markus Begerow]]

## Milestones

- [x] Architecture RFC approved — 2024-01-15
- [x] Design system v1 shipped — 2024-02-01
- [x] Alpha release (internal) — 2024-02-28
- [ ] Beta launch (closed) — 2024-04-15
- [ ] Public launch — 2024-06-30

## Key Decisions

- Chose Rust backend over Node.js for latency targets — see [[Product Decisions]]
- Adopted event-sourcing for audit log requirements
- Universal macOS build (Apple Silicon + Intel) via Tauri

## Related Meetings

- [[2024-03-11 Aurora Kickoff]]
- [[2024-03-14 Weekly Standup]]
- [[2024-03-18 Design Review]]
- [[2024-03-25 Q2 Planning]]
- [[2024-03-28 Aurora Retrospective]]

## Risks

- API contract drift between frontend and backend
- Third-party auth provider reliability (tracked in [[Project Nebula]])
- Design system adoption lag in external-facing components

## Open Issues

See Emma's QA dashboard for current bug list. Critical blockers escalate to [[Bob Martinez]] directly.
