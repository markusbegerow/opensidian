# Product Decisions

A running log of key architectural and product decisions with their rationale.

---

## 2024-03-22 - Event-Sourcing for Nebula Audit Log

**Decision:** Use event sourcing (append-only event store) for [[Project Nebula]] audit log.
**Made by:** [[David Park]], reviewed by [[Alice Chen]]
**Meeting:** [[2024-03-22 Nebula Architecture Review]]

**Rationale:** Full replay capability for debugging, tamper-evident log for compliance, and decoupled consumers. PostgreSQL with JSONB column chosen over Kafka to avoid ops overhead.

---

## 2024-03-22 - Custom Secret Manager for Nebula

**Decision:** Build a minimal custom secret store (not wrap HashiCorp Vault).
**Made by:** [[David Park]], reviewed by [[Alice Chen]]
**Meeting:** [[2024-03-22 Nebula Architecture Review]]

**Rationale:** Vault is operationally complex and expensive at our scale. Custom store with AES-256 encryption fits current needs and eliminates licensing cost.

---

## 2024-01-15 - Rust Backend for Aurora

**Decision:** Use Rust for [[Project Aurora]] backend instead of Node.js.
**Made by:** [[Alice Chen]], [[David Park]]

**Rationale:** Benchmarks showed 3x throughput improvement over the Node.js prototype. Meets the <200ms latency target for real-time sync. Rust expertise already present on the team.

---

## 2024-01-15 - WebSockets over Long-Polling for Aurora Sync

**Decision:** Use WebSockets for real-time sync in [[Project Aurora]].
**Made by:** [[Alice Chen]]
**Meeting:** [[2024-03-11 Aurora Kickoff]]

**Rationale:** Long-polling cannot reliably hit the <200ms latency target under load. WebSocket connection overhead is acceptable at projected user scale.

---

## 2024-02-01 - Cursor-Based Pagination for Aurora API

**Decision:** Use cursor-based pagination on all list endpoints (not offset-based).
**Made by:** [[David Park]]

**Rationale:** Offset pagination has correctness issues under concurrent writes (items can be skipped or duplicated as pages shift). Cursor-based pagination is stable.
