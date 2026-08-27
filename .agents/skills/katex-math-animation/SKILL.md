---
name: katex-math-animation
description: Best practices for animating KaTeX math formulas, multiline equation alignment, variable highlighting, and step-by-step math derivations in Remotion.
---

# KaTeX Math Animation Skill

This skill provides guidelines and patterns for animating mathematical equations using KaTeX in Remotion videos.

## 1. Importing KaTeX
Always ensure KaTeX styles are imported in the composition file or root:
```tsx
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
```

## 2. Dynamic Variable Highlighting Across Frames
To highlight specific variables or terms during a derivation, wrap target terms in `\textcolor{color}{...}` in the LaTeX string based on frame state:

```tsx
const getFormula = (frame: number) => {
  if (frame < 60) {
    return "a^2 + b^2 = c^2";
  }
  // Highlight hypotenuse c^2 in cyan after frame 60
  return "a^2 + b^2 = \\textcolor{#38bdf8}{c^2}";
};
```

## 3. Step-by-Step Equation Derivations
Use Remotion's `interpolate()` and `spring()` to animate equations sliding or fading in line by line:

```tsx
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const steps = [
  "f(x) = \\int x^2 \\, dx",
  "= \\frac{x^3}{3} + C"
];

export const DerivationStep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div>
      {steps.map((step, idx) => {
        const stepSpring = spring({
          frame: frame - idx * 45,
          fps,
          config: { damping: 12 },
        });
        const opacity = interpolate(stepSpring, [0, 1], [0, 1]);
        const translateY = interpolate(stepSpring, [0, 1], [20, 0]);

        return (
          <div key={idx} style={{ opacity, transform: `translateY(${translateY}px)` }}>
            <BlockMath math={step} />
          </div>
        );
      })}
    </div>
  );
};
```

## 4. Multiline Math Alignment
Use LaTeX `\begin{aligned} ... \end{aligned}` blocks for multi-step proofs:
```tsx
const proof = `
\\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\\\
&= a^2 + ab + ba + b^2 \\\\
&= a^2 + 2ab + b^2
\\end{aligned}
`;
```
