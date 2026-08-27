---
name: math-voiceover-subtitles
description: Patterns for synchronizing voiceover audio, subtitles, and math formula highlights in Remotion compositions.
---

# Math Voiceover & Subtitles Skill

This skill provides best practices for synchronizing math narration audio, subtitle captions, and on-screen equation highlights in Remotion.

## 1. Including Voiceover Audio
Use Remotion's `<Audio>` tag inside your composition or `<Sequence>`:

```tsx
import { Audio, Sequence, staticFile } from "remotion";

export const LessonWithAudio: React.FC = () => {
  return (
    <>
      <Sequence from={0}>
        <Audio src={staticFile("audio/lesson-intro.mp3")} volume={1.0} />
      </Sequence>
      {/* Visual Composition components... */}
    </>
  );
};
```

## 2. Timed Captions & Subtitles Component
Define structured subtitle cues mapped to frame ranges:

```tsx
interface SubtitleCue {
  startFrame: number;
  endFrame: number;
  text: string;
}

const cues: SubtitleCue[] = [
  { startFrame: 0, endFrame: 60, text: "今天我们来学习勾股定理。" },
  { startFrame: 60, endFrame: 150, text: "对于任意直角三角形，两直角边的平方和等于斜边的平方。" },
  { startFrame: 150, endFrame: 240, text: "公式表示为 a 的平方加上 b 的平方等于 c 的平方。" },
];

export const MathSubtitles: React.FC<{ frame: number }> = ({ frame }) => {
  const currentCue = cues.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );

  if (!currentCue) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        width: "100%",
        textAlign: "center",
        color: "#ffffff",
        fontSize: "28px",
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      }}
    >
      {currentCue.text}
    </div>
  );
};
```

## 3. Synchronizing Math Formula Steps with Narration Cues
Pass the current subtitle cue ID or index down to your math formula components to trigger step reveals and color highlights in sync with the spoken voiceover.
