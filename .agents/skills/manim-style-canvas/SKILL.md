---
name: manim-style-canvas
description: Patterns for recreating 3Blue1Brown Manim-style linear transformations, grid warpings, and smooth camera pan/zoom animations in Remotion.
---

# Manim Style Canvas Skill

This skill provides patterns for implementing 3Blue1Brown (Manim) style visual mathematical transformations in React & Remotion.

## 1. Linear Transformation Matrix Grid Warping
Transform 2D grid vectors $(x, y)^T$ using matrix $M = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ interpolated over frames:

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const GridTransformation: React.FC = () => {
  const frame = useCurrentFrame();

  // Interpolate matrix elements from identity to shear matrix [[1, 1], [0, 1]]
  const progress = interpolate(frame, [30, 120], [0, 1], { extrapolateRight: "clamp" });
  const a = 1, b = progress * 1;
  const c = 0, d = 1;

  // Transform point (x, y)
  const transformPoint = (x: number, y: number) => {
    return {
      tx: a * x + b * y,
      ty: c * x + d * y,
    };
  };

  return (
    <svg width={1920} height={1080} viewBox="-500 -500 1000 1000">
      {/* Grid Lines Rendering */}
    </svg>
  );
};
```

## 2. Smooth Camera Pan and Zoom
Wrap scene graphics in a dynamic `<g>` or `<div>` with pan and zoom transform properties:

```tsx
const zoom = interpolate(frame, [0, 90], [1, 2.5]);
const panX = interpolate(frame, [0, 90], [0, -300]);
const panY = interpolate(frame, [0, 90], [0, 150]);

<div
  style={{
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: "center center",
  }}
>
  {/* Math Scene */}
</div>
```
