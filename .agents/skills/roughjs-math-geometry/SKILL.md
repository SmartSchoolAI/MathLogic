---
name: roughjs-math-geometry
description: Best practices for rendering hand-drawn geometry, Cartesian coordinates, vector arrows, and chalk-style blackboard diagrams using RoughJS in Remotion.
---

# RoughJS Math Geometry Skill

This skill provides patterns for drawing hand-drawn blackboard geometry and diagrams in Remotion math videos using RoughJS and HTML Canvas.

## 1. Basic Canvas Setup in Remotion
Use a `<canvas>` element with a `useEffect` hook listening to Remotion's `frame` state:

```tsx
import React, { useEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import rough from "roughjs";

export const GeometryCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    // Draw frame-based animations here...
  }, [frame]);

  return <canvas ref={canvasRef} width={600} height={400} />;
};
```

## 2. Progressive Stroke Animation (Hand-Drawn Effect)
Interpolate shape endpoints or polygon vertices according to the progress `(frame - startFrame) / duration`:

```tsx
const progress = Math.min(1, Math.max(0, (frame - 30) / 45));

// Draw progress portion of line (x1, y1) to (x2, y2)
const currentX2 = x1 + (x2 - x1) * progress;
const currentY2 = y1 + (y2 - y1) * progress;

rc.line(x1, y1, currentX2, currentY2, {
  stroke: "#38bdf8",
  strokeWidth: 3,
  roughness: 1.5,
});
```

## 3. Coordinate Axes & Vector Arrows
Create helper routines for rendering hand-drawn Cartesian axes:

```tsx
const drawAxes = (rc: any, width: number, height: number, progress: number) => {
  const originX = width / 2;
  const originY = height / 2;

  // X Axis
  rc.line(50, originY, 50 + (width - 100) * progress, originY, { stroke: "#94a3b8", roughness: 1 });
  // Y Axis
  rc.line(originX, height - 50, originX, height - 50 - (height - 100) * progress, { stroke: "#94a3b8", roughness: 1 });
};
```

## 4. Chalkboard Fills & Styles
RoughJS supports hand-drawn fills like `hachure`, `solid`, `zigzag`, `cross-hatch`, and `dots`:

```tsx
rc.circle(200, 200, 150, {
  fill: "rgba(56, 189, 248, 0.2)",
  fillStyle: "hachure",
  fillWeight: 2,
  hachureAngle: 60,
  stroke: "#38bdf8",
  strokeWidth: 3,
});
```
