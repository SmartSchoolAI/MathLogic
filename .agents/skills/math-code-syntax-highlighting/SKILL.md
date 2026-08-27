---
name: math-code-syntax-highlighting
description: Best practices for displaying and animating numerical algorithm code blocks alongside mathematical proofs in Remotion.
---

# Math Code Syntax Highlighting Skill

This skill provides patterns for animating code implementations of numerical algorithms alongside mathematical formulas in Remotion.

## 1. Typewriter Line Reveal
Display code snippets line by line in sync with mathematical steps:

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";

const codeLines = [
  "def euler_method(f, y0, t0, h, steps):",
  "    t, y = t0, y0",
  "    for _ in range(steps):",
  "        y += h * f(t, y)",
  "        t += h",
  "    return y",
];

export const AnimatedCodeBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const visibleLineCount = Math.min(codeLines.length, Math.floor(frame / 15) + 1);

  return (
    <pre style={{ background: "#1e293b", color: "#f8fafc", padding: 24, borderRadius: 12 }}>
      <code>
        {codeLines.slice(0, visibleLineCount).join("\n")}
      </code>
    </pre>
  );
};
```
