---
name: Technical View layout constants
description: Pixel positions for the AnalysisTrace → Technical View swimlane fork/join connectors. Must update these whenever node width or ConnectorH width changes.
---

## Current component sizes (AnalysisTrace.tsx)
- **TechNode**: `w-28` = 112px, half = 56px. Compact card (`p-2`, no inline snippets/checks/formula — details in inspector only).
- **ConnectorH**: explicit `style={{ width: '24px' }}` (flex-1 line + w-3 arrow). No gap-N on row flex containers.
- **GhoNode**: compact `p-2 gap-1` dashed-border card, `w-full` inside its column.
- **InspectorPanel**: `w-60` (240px).

## Row 1 positions (no gap between flex children)
```
N(112) + C(24) + N(112) + C(24) + N(112) = 384px total
Orchestration centre = 112+24+112+24+56 = 328px
```

## Branch (Row 2) positions
- Left col: 0–112px, **centre = 56px**
- Spacer: 96px (right col starts at 208px)
- Right col: 208–320px, **centre = 264px**

## Fork connector (height: 20px, stem/bar at 10px)
```
Stem:     left=328px, top=0,   height=10px
Bar:      left=56px,  width=272px (56→328), top=10px
Left drop: left=56px,  top=10px, bottom=0
Right drop: left=264px, top=10px, bottom=0
```

## Join connector (height: 20px, stem/bar at 10px)
```
Left stem:  left=56px,  top=0, height=10px
Right stem: left=264px, top=0, height=10px
Bar:        left=56px,  width=208px (56→264), top=10px
Drop:       left=56px,  top=10px, bottom=0
```

## Arrow into Row 3
`paddingLeft: '50px'` (centres w-3=12px arrow at 56px: 56-6=50)

## Row 3 total width
4×112 + 3×24 = 520px (fits in flex-1 center column at 1280px+ viewport)

## Swimlane columns
- Left (GHO environment): `w-44` (176px), `p-3`
- Center (Deal Signal): `flex-1`, `p-3`, no `min-h`
- Right (GHO outputs): `w-60` (240px), `p-3`

**Why:** Getting these wrong produces fork/join bars that visually miss the node centres. The no-min-h policy is what keeps the diagram fitting on screen without scrolling.

**How to apply:** Any time node size or connector size changes, recalculate all positions from scratch using: left-branch-centre = half of node-width, orchestration-centre = node+conn+node+conn+half-node.
