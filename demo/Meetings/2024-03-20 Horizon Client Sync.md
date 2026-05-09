# 2024-03-20 Horizon Client Sync

**Date:** 2024-03-20
**Time:** 11:00 - 11:45 CET
**Format:** Video call (external)
**Project:** [[Project Horizon]]

---

## Attendees

**Internal:**
- [[Bob Martinez]] (lead)
- [[Emma Wilson]] (QA notes)

**Client (RetailCorp):**
- Thomas Hauer - Head of IT
- Lena Brandt - Project Coordinator

## Context

UAT was scheduled to begin 2024-03-11 but the client has not started testing. This sync was called to unblock.

## Discussion

### Why UAT Has Not Started

Thomas Hauer confirmed two blockers on the client side:
1. Internal IT policy review for new SaaS tools - approval pending with their CISO
2. Three key business users who need to sign off on UAT were on leave until March 18

### Revised Timeline

Agreed new UAT schedule:
- UAT environment access granted: 2024-03-22
- Testing window: 2024-03-22 to 2024-04-07
- Feedback deadline: 2024-04-07
- Fix window: 2024-04-08 to 2024-04-14
- UAT sign-off: 2024-04-14
- Go-live: **2024-04-30** (unchanged, recoverable)

[[Bob Martinez]] confirmed the go-live date remains at risk if any critical defects are found after April 7.

### Open Issues Raised by Client

1. The date range filter on the Monthly Revenue report resets on page reload - [[Emma Wilson]] confirmed this is a known bug, fix in progress
2. Client wants a CSV export on all 14 reports - this was not in the original scope

### Scope Change: CSV Export

[[Bob Martinez]] flagged CSV export as out of scope per the original contract. Thomas Hauer pushed back. Bob committed to a written response within 48 hours.

## Action Items

| Owner | Action | Due |
|---|---|---|
| [[Bob Martinez]] | Send written scope change assessment (CSV export) | 2024-03-22 |
| [[Emma Wilson]] | Fix date filter reset bug on staging | 2024-03-21 |
| [[Bob Martinez]] | Send UAT access credentials to Lena Brandt | 2024-03-22 |

## Next Meeting

Follow-up sync if UAT blockers arise. Otherwise next touchpoint is go-live readiness call, 2024-04-25.
