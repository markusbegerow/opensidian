# 2024-03-28 Aurora Retrospective

**Date:** 2024-03-28
**Time:** 14:00 - 15:30 CET
**Format:** Video call
**Project:** [[Project Aurora]]
**Sprint:** Q1 final sprint (March)

---

## Attendees

- [[Alice Chen]] (facilitator)
- [[Bob Martinez]]
- [[David Park]]
- [[Sarah Kim]]
- [[Emma Wilson]]

## What Went Well

- DB migration to PostgreSQL 16 completed with zero downtime ([[David Park]])
- Design system v1.2 shipped ahead of schedule ([[Sarah Kim]])
- Q1 regression rate: 6% - down from 14% in Q4 2023 ([[Emma Wilson]])
- Aurora Kickoff produced clear ownership and action items ([[Alice Chen]])

## What Did Not Go Well

- API contract was frozen 5 days late - caused frontend to wait ([[David Park]] + [[Alice Chen]])
- Three flaky E2E tests in auth flow still not resolved ([[Emma Wilson]])
- Onboarding copy not delivered on time - blocked [[Sarah Kim]] for 10 days ([[Bob Martinez]])
- Real-time sync RFC got low async engagement

## Root Cause Analysis

### API Contract Delay

PR review was deprioritized during the DB migration week. Fix: contract freeze is now a P0 item - block other PR reviews until it merges.

### Flaky E2E Tests

Tests depend on a shared staging auth service with ~95% uptime. [[Emma Wilson]] proposes mocking the auth service in CI. Will implement in Q2.

### Copy Delay

[[Bob Martinez]] had no reminder system for async content requests. Going forward: shared task tracker item with a hard due date.

## Experiments for Q2

| Experiment | Owner | Success Metric |
|---|---|---|
| Pact contract testing | [[Alice Chen]] | Zero contract drift incidents |
| Auth service mock in CI | [[Emma Wilson]] | Flaky test rate < 1% |
| Content request tracker | [[Bob Martinez]] | 0 copy delays > 3 days |

## Team Health (Pulse Survey, scale 1-5)

- Clarity of goals: 4.2
- Collaboration quality: 4.6
- Workload sustainability: 3.8 (flagged)
- Tooling satisfaction: 3.5 (flagged)

[[Alice Chen]] flagged workload and tooling scores. [[Project Nebula]] expected to improve tooling score in Q3.

## Next Meeting

Next retrospective: end of Q2 (late June). Weekly standups continue every Thursday.
