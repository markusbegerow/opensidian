# 2024-03-14 Weekly Standup

**Date:** 2024-03-14  
**Time:** 09:15 – 09:45 CET  
**Format:** Video call (recurring, every Thursday)

---

## Attendees

- [[Alice Chen]]
- [[Bob Martinez]]
- [[David Park]]
- [[Sarah Kim]]
- [[Emma Wilson]]

## Status Updates

### Alice Chen — Engineering

- Frontend: Workspace switcher is done, currently blocked on API contract freeze
- Opened RFC for real-time sync architecture — awaiting async feedback
- Blocker: need [[David Park]] to merge auth token refresh endpoint by EOD Friday

### Bob Martinez — Product

- User feedback from alpha: top complaint is notification noise (creating ticket)
- Horizon: client has not responded to UAT invite — escalating via account manager
- Q2 roadmap draft is 80% done, will share async before [[2024-03-25 Q2 Planning]]

### David Park — Backend

- DB migration to PostgreSQL 16 completed on staging ✅
- Auth refresh endpoint: PR open, review requested from [[Alice Chen]]
- Nebula: had initial architecture discussion, scheduling dedicated [[2024-03-22 Nebula Architecture Review]]

### Sarah Kim — Design

- Component library v1.2 shipped to Figma — 23 components
- Running usability test sessions with 5 external users next week
- Blocker: needs copy from [[Bob Martinez]] for onboarding flow

### Emma Wilson — QA

- Q1 QA metrics: 94% test pass rate, 12 regressions caught pre-release
- Identified 3 flaky E2E tests in the auth flow — investigating
- Started writing QA checklist for [[Project Horizon]] UAT

## Blockers Summary

| Person | Blocker | Waiting on |
|---|---|---|
| [[Alice Chen]] | API contract not frozen | [[David Park]] |
| [[Sarah Kim]] | Missing copy for onboarding | [[Bob Martinez]] |

## Next Meeting

[[2024-03-18 Design Review]] (subset — design + engineering only)
