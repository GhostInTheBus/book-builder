# PROJECT: Book-Builder (Final High-Fidelity Studio)
## Status: Phase 1-4 Complete (Production Ready)

### 1. Vision & Intent
**Book-Builder** is a high-fidelity studio for photographers to rapidly sequence and layout professional books. It has successfully pivoted from a "spatial table" to a **Book-First skeuomorphic designer**. It bridges the gap between the "Sensory Laboratory" of life (the image) and the "Academic Armor" of the institution (the theory/text).

### 2. Core Philosophy & Design DNA
- **Design Anchor:** Refer to `DESIGN_PRINCIPLES.md` for sequencing, typography, and layout rules.
- **Embedded Witness:** UI is split into Archive (Bottom), Theory (Left), Stage (Center), and Logic (Right).
- **The InDesign Bridge v2.0:** A robust JSON -> Adobe ExtendScript pipeline that handles both image placement and theoretical text frame generation.

### 3. Current Implementation (The "Studio" State)
- **Skeuomorphic Stage:** A centered 3D book spread with page-turning physics, gutter shadows, and local paper textures (no external dependencies).
- **Academic Armor Panel (Left):** Manages theoretical fragments (Foucault, Rubin, etc.). Drag-and-drop support for text onto page slots.
- **Sociological Lens (Right):** Inspector for global book settings and per-page layout overrides.
- **Procedural Rhythm Engine:** Templates (Monograph, Diptych, Release, Academic Anchor) can be applied globally or surgical overrides can be made per page.
- **Local Workspace:** Fully portable at `/Volumes/ai_workspace/projects/book-builder`.

### 4. Technical Architecture
- **Framework:** React / Vite / Zustand.
- **Stage Logic:** `src/designer/SpreadView.tsx` handles the 3D transforms and page index mapping.
- **Slot Logic:** `src/book/BookSlot.tsx` is "content-aware" (detects Image vs. Text drops).
- **Export Logic:** `src/lib/bookExport.ts` generates a comprehensive JSON map of coordinates and contents.
- **Automation:** `indesign/BuildBook.jsx` (v2.0) automates the final InDesign document build.

### 5. Audit Log (Rework Summary)
- **Connectivity:** Replaced all external texture URLs with local Base64 assets for offline/nomadic work.
- **Physics:** Refined the "Gutter Shadow" and "Crease" logic for better visual depth.
- **Bridge Reliability:** Unified the procedural assignment keys (`pageIndex-slotId`) across the UI, Store, and Export libraries.

### 6. Technical Instructions for Future Reviewers
- **Launch:** Run `npm run dev` in `phototable-src`.
- **State:** Core state is in `useStore().book`. Note the `pageOverrides` record which prioritizes local layouts over the `templateId` base.
- **Templates:** New layouts should be added to `src/templates/index.ts` following the `BookTemplate` interface.

---
*Last Updated: 2026-04-27 (Post-Audit Finalization)*
