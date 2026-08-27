# MathLogic Project Rules & Design Guidelines

This project builds interactive mathematical animation videos using Remotion, KaTeX, RoughJS, and Three.js.

## 1. Design & Aesthetic Standards
- **Color Palette (Dark Blackboard Mode)**:
  - Background: `#0f172a` (Slate 900)
  - Card Containers: `rgba(30, 41, 59, 0.85)` (Slate 800)
  - Primary Math Text: `#f8fafc` (Slate 50)
  - Secondary Math Labels: `#94a3b8` (Slate 400)
  - Highlight Color 1: `#38bdf8` (Sky Blue)
  - Highlight Color 2: `#818cf8` (Indigo)
  - Accent/Alert: `#f43f5e` (Rose) / `#f59e0b` (Amber)
- **Typography**: Clean sans-serif UI typography (`'Segoe UI'`, `Roboto`, `sans-serif`) paired with crisp KaTeX math typography.

## 2. Remotion Video Composition Rules
- **Resolution**: 1920x1080 (16:9 standard).
- **Frame Rate**: Default 30 FPS.
- **Animation Motion**: Prefer `spring()` and `interpolate()` over CSS static transitions for organic math movement.
- **Component Isolation**: Each lesson should reside under `src/<LessonName>/index.tsx` and be registered in `src/Root.tsx`.

## 3. Skill & Helper Discovery
- `katex-math-animation`: Formula proofs & step highlighting.
- `roughjs-math-geometry`: Hand-drawn diagrams & coordinate systems.
- `math-function-plotting`: 2D function curves & integral fills.
- `threejs-3d-math`: 3D surfaces & vector fields.
- `manim-style-canvas`: Matrix linear transformations.
- `remotion-best-practices`: Remotion core video architecture.
