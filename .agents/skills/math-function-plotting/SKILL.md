---
name: math-function-plotting
description: Techniques for plotting 2D mathematical functions, sine waves, polynomial curves, tangent lines, and area under curve animations in Remotion.
---

# Math Function Plotting Skill

This skill outlines how to build dynamic 2D function graphs (polynomials, trigonometric functions, calculus animations) in Remotion using SVG paths or Canvas.

## 1. Generating SVG Path from Math Functions
To render a smooth function curve $y = f(x)$, compute SVG `d` path strings dynamically:

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const SineWavePlot: React.FC = () => {
  const frame = useCurrentFrame();

  // Animate frequency and phase shift over frames
  const phase = frame * 0.05;
  const width = 800;
  const height = 400;
  const centerY = height / 2;

  const points: string[] = [];
  for (let x = 0; x <= width; x += 5) {
    const mathX = (x / width) * 4 * Math.PI; // Map pixel X to [0, 4pi]
    const mathY = Math.sin(mathX + phase);
    const pixelY = centerY - mathY * 100;    // Scale amplitude by 100px
    points.push(`${x},${pixelY}`);
  }

  const pathData = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={pathData} fill="none" stroke="#38bdf8" strokeWidth={4} />
    </svg>
  );
};
```

## 2. Animated Graph Drawing with `strokeDashoffset`
To make the function draw itself from left to right as the video plays:

```tsx
const pathLength = 1200; // Total approximate SVG path length
const strokeDashoffset = interpolate(frame, [0, 90], [pathLength, 0], {
  extrapolateRight: "clamp",
});

<path
  d={pathData}
  fill="none"
  stroke="#818cf8"
  strokeWidth={4}
  strokeDasharray={pathLength}
  strokeDashoffset={strokeDashoffset}
/>
```

## 3. Tangent Line Animation (Derivative Visualization)
Plotting a tangent line moving along a curve $f(x) = x^2$:

```tsx
// Animated x-coordinate of tangency point
const posX = interpolate(frame, [0, 150], [-2, 2]); // x in [-2, 2]
const posY = posX * posX;                           // f(x) = x^2
const slope = 2 * posX;                              // f'(x) = 2x

// Tangent line endpoints in math space
const x1 = posX - 1;
const y1 = posY - slope;
const x2 = posX + 1;
const y2 = posY + slope;
```

## 4. Shading Area Under Curve (Integral Visualization)
To shade the area under a curve $\int_a^b f(x)\,dx$, append bottom line points $(x_{end}, y_{origin}) \to (x_{start}, y_{origin}) \to Z$ to create a closed SVG polygon fill:

```tsx
const areaPath = `M ${points.join(" L ")} L ${width},${centerY} L 0,${centerY} Z`;

<path d={areaPath} fill="rgba(56, 189, 248, 0.25)" />
```
