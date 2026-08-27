---
name: remotion-audio-sfx
description: Best practices for adding pop sounds, chalk writing audio effects, and transition SFX synchronized to frame triggers in Remotion.
---

# Remotion Audio & SFX Skill

This skill provides patterns for adding sound effects (SFX) to mathematical animations in Remotion.

## 1. Frame-Triggered Sound Effects
Play short SFX (pop, swoosh, chalk stroke, bell) when specific equations reveal or animations trigger:

```tsx
import { Audio, Sequence, staticFile } from "remotion";

export const MathAnimationSFX: React.FC = () => {
  return (
    <>
      {/* Pop sound when formula appears at frame 30 */}
      <Sequence from={30}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.8} />
      </Sequence>

      {/* Chalk writing SFX during drawing phase */}
      <Sequence from={60} durationInFrames={90}>
        <Audio src={staticFile("sfx/chalk-writing.mp3")} volume={0.5} />
      </Sequence>
    </>
  );
};
```
