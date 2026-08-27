---
name: remotion
description: Guidelines and instructions for creating, animating, and previewing Remotion math video compositions with KaTeX and RoughJS.
---

# Remotion Math Video Development Skill

This skill guides the creation and maintenance of Remotion video compositions in the `MathLogic` repository.

## Directory Structure
- Entry point: `src/index.ts` (registers `Root`)
- Root Composition file: `src/Root.tsx` (defines compositions, duration, fps, resolution)
- Compositions: `src/<CompositionName>/index.tsx`

## Core Concepts & Standards

### 1. Remotion Animations
- Use `useCurrentFrame()` and `useVideoConfig()` to derive animation timing.
- Use `spring()` and `interpolate()` for smooth motion instead of CSS transitions.
- Wrap video content inside `<AbsoluteFill>`.

### 2. Math Formula Rendering (KaTeX)
- Use `react-katex` components:
  - `<InlineMath math="..." />` for inline math notation.
  - `<BlockMath math="..." />` for display formulas.
- Ensure KaTeX styles are imported: `import "katex/dist/katex.min.css"`.

### 3. Geometry & Diagram Rendering (RoughJS)
- Use `rough.canvas(canvasElement)` inside a `useEffect` tied to `frame`.
- Progressively draw shapes based on `frame` interpolation to simulate hand-drawn math blackboard effects.

### 4. Command Line Development Workflow
- Preview Remotion compositions in interactive studio:
  ```bash
  pnpm run dev
  # or
  pnpm start
  ```
- Typecheck TypeScript files:
  ```bash
  pnpm run typecheck
  ```
