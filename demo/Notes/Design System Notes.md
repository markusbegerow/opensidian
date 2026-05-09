# Design System Notes

Shared reference for design-engineering alignment on [[Project Aurora]] component decisions.
Maintained by [[Sarah Kim]] and [[Alice Chen]].

---

## Component API Conventions

- Prefer semantic variant names (`primary`, `ghost`, `danger`) over visual descriptors (`blue`, `outlined`)
- Size props use t-shirt sizes: `sm`, `md`, `lg` - no numeric pixel values
- Status/state props use `status` key: `default`, `error`, `success`, `warning`
- Icons always 20px grid (not 24px) to match design density targets

## Approved Components (v1.2)

| Component | Status | Notes |
|---|---|---|
| Button | Stable | Variants: primary, ghost, danger |
| Input | Stable | |
| Select | Stable | |
| DatePicker | Stable | Uses date-fns (already bundled) |
| Toast | Stable | 4 kinds: info, success, error, warning |
| Avatar | Stable | Sizes: sm, md, lg |
| Sidebar | Stable | Collapsible sections |
| Modal | In progress | |
| DataTable | Planned | |
| Calendar | Planned | |

## Token Reference

Defined in `src/index.css` and `tailwind.config.ts`:

| Token | Usage |
|---|---|
| `base` | Page background |
| `surface` | Card / panel background |
| `border` | Dividers and outlines |
| `accent` | Interactive / active states |
| `muted` | Secondary text, placeholders |

## Open Decisions

- Mobile breakpoints: deferred to post-beta ([[2024-03-18 Design Review]])
- DataTable: column pinning in scope? - needs [[Bob Martinez]] input on use cases
- Animation: transition duration tokens not yet standardized

## Related Meetings

- [[2024-03-18 Design Review]] - Component API decisions
- [[2024-03-11 Aurora Kickoff]] - Initial design alignment
