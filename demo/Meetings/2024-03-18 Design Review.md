# 2024-03-18 Design Review

**Date:** 2024-03-18  
**Time:** 14:00 – 15:30 CET  
**Location:** Video call  
**Project:** [[Project Aurora]]

---

## Attendees

- [[Sarah Kim]] (facilitator)
- [[Alice Chen]]
- [[Bob Martinez]] (observer)

## Purpose

Review the new component library and agree on the component API contract between design and engineering before handoff.

## Presented Components

### Navigation System

[[Sarah Kim]] presented the revised sidebar navigation with collapsible sections. Key decisions:
- Icons use 20px grid (not 24px) to match current density
- Active state uses `accent` token, not a border — aligns with [[Alice Chen]]'s implementation
- Mobile breakpoint deferred to post-beta

### Form Components

New input, select, and date picker components reviewed. [[Alice Chen]] flagged that the date picker requires a third-party lib (date-fns). Agreed to proceed — already in the bundle.

### Notification Toasts

Three variants: info, success, error. [[Bob Martinez]] requested a fourth: warning. [[Sarah Kim]] to add before final export.

## Component API Decisions

| Component | Prop name | Type | Notes |
|---|---|---|---|
| `<Button>` | `variant` | `primary \| ghost \| danger` | No `secondary` — use `ghost` |
| `<Input>` | `status` | `default \| error \| success` | |
| `<Toast>` | `kind` | `info \| success \| error \| warning` | warning added per Bob |
| `<Avatar>` | `size` | `sm \| md \| lg` | No numeric sizes |

## Action Items

| Owner | Action | Due |
|---|---|---|
| [[Sarah Kim]] | Add warning toast variant, re-export Figma file | 2024-03-20 |
| [[Alice Chen]] | Implement agreed component APIs in codebase | 2024-03-25 |
| [[Alice Chen]] | Document components in internal Storybook | 2024-03-28 |

## Notes

[[Alice Chen]] and [[Sarah Kim]] agreed to set up a shared Notion page for ongoing design–engineering decisions. Referred to as [[Design System Notes]].

## Next Meeting

[[2024-03-25 Q2 Planning]]
