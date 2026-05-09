# 2024-03-11 Aurora Kickoff

**Date:** 2024-03-11  
**Time:** 10:00 – 12:00 CET  
**Location:** Berlin HQ — Room Orion  
**Project:** [[Project Aurora]]

---

## Attendees

- [[Alice Chen]] (facilitator)
- [[Bob Martinez]]
- [[David Park]]
- [[Sarah Kim]]

## Agenda

1. Mission & goals recap
2. Technical roadmap walkthrough
3. API contract draft review
4. MVP scope definition
5. Open questions

## Notes

### Technical Roadmap (Alice Chen)

[[Alice Chen]] walked through the revised architecture diagram. Key change: the real-time sync layer will use WebSockets instead of long-polling to hit the <200ms latency target. Rust backend confirmed as the right choice after benchmarks showed 3× throughput over the Node.js prototype.

### API Contract (David Park)

[[David Park]] shared the draft OpenAPI spec. Two breaking changes flagged vs. the alpha version:
- `/sessions` endpoint now returns `cursor`-based pagination (not offset)
- Auth tokens expire after 15 min; refresh token flow added

[[Alice Chen]] requested a 1-week review window before the contract is frozen.

### MVP Scope (Bob Martinez)

[[Bob Martinez]] confirmed the following is in-scope for beta:
- Workspace creation & member management
- Task board (Kanban only, no Gantt)
- File uploads up to 50 MB
- Basic notifications (email only)

Out of scope for beta: mobile app, API webhooks, SSO (tracked in [[Project Nebula]]).

### Design Alignment (Sarah Kim)

[[Sarah Kim]] confirmed the component library is ready for handoff. She will schedule a dedicated [[2024-03-18 Design Review]] for the new interaction patterns.

## Action Items

| Owner | Action | Due |
|---|---|---|
| [[David Park]] | Freeze API contract after review window | 2024-03-20 |
| [[Alice Chen]] | Publish frontend architecture RFC | 2024-03-15 |
| [[Bob Martinez]] | Confirm beta tester list with marketing | 2024-03-18 |
| [[Sarah Kim]] | Schedule component handoff session | 2024-03-13 |

## Next Meeting

[[2024-03-14 Weekly Standup]]
