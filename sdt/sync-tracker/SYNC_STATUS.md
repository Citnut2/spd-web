# Porting Sync Status

**Last verified:** 2026-06-10T05:53:36Z
**Seed:** TEST-ABC
**Hero:** WARRIOR

## Test Results

| Seed | Hero | Depth | Actions | Status |
|------|------|-------|---------|--------|
| TEST-ABC | WARRIOR | 1 | `wait=2 move=0,-1 move=-1,0` | ✅ 5 states dumped |

## Notes
- Java harness requires JDK 11+ and compiled SPD JARs
- Web harness validates determinism (same seed → same state)
- Full parity compares Java vs Web state arrays

## Mismatches
(None detected — Java dump parsed successfully)
