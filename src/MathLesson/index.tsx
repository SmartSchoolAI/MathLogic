import React, { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import rough from "roughjs";
import { Sparkles, Calculator, BookOpen, Volume2, CheckCircle2 } from "lucide-react";

import defaultSummaryData from "../../public/001-pythagorean-theorem/summary.json";

export type MathLessonData = typeof defaultSummaryData;

export interface MathLessonProps {
  lessonData?: MathLessonData;
}

export const MathLesson: React.FC<MathLessonProps> = ({
  lessonData = defaultSummaryData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    title,
    formula,
    sections,
    subtitles,
    audio,
    durationInFrames,
  } = lessonData;

  // Determine current active section
  const currentSection =
    sections.find((s) => frame >= s.startFrame && frame < s.endFrame) ||
    sections[sections.length - 1];

  const currentSectionIdx = sections.findIndex(
    (s) => s.id === currentSection.id
  );

  // Section local relative frame
  const localFrame = frame - currentSection.startFrame;

  // Header Animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [-80, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Main Card Entrance Animation for Section Transitions
  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14 },
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // RoughJS Multi-Proof Progressive Geometry Canvas Renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    // ----------------------------------------------------
    // Section 1: Basic Definition (Progressive Hand Drawing)
    // ----------------------------------------------------
    if (currentSection.id === "section-1") {
      const C: [number, number] = [100, 240];
      const B: [number, number] = [340, 240];
      const A: [number, number] = [100, 60];

      // Dotted skeleton outline
      rc.polygon([C, B, A], {
        stroke: "rgba(148, 163, 184, 0.25)",
        strokeWidth: 2,
        strokeLineDash: [8, 6],
        seed: 999,
      });

      // Step 1: Edge a (Bottom)
      const pA = Math.min(1, Math.max(0, (localFrame - 15) / 35));
      if (pA > 0) {
        rc.line(C[0], C[1], C[0] + (B[0] - C[0]) * pA, C[1], {
          stroke: "#38bdf8",
          strokeWidth: 4,
          seed: 101,
        });
      }

      // Step 2: Edge b (Left vertical)
      const pB = Math.min(1, Math.max(0, (localFrame - 50) / 35));
      if (pB > 0) {
        rc.line(C[0], C[1], C[0], C[1] + (A[1] - C[1]) * pB, {
          stroke: "#818cf8",
          strokeWidth: 4,
          seed: 102,
        });
      }

      // Step 3: Edge c (Hypotenuse)
      const pC = Math.min(1, Math.max(0, (localFrame - 85) / 35));
      if (pC > 0) {
        rc.line(A[0], A[1], A[0] + (B[0] - A[0]) * pC, A[1] + (B[1] - A[1]) * pC, {
          stroke: "#f59e0b",
          strokeWidth: 4.5,
          seed: 103,
        });
      }

      // Step 4: Fill & Right angle marker
      if (pC >= 1) {
        rc.polygon([C, B, A], {
          stroke: "transparent",
          fill: "rgba(56, 189, 248, 0.15)",
          fillStyle: "hachure",
          seed: 104,
        });
        rc.rectangle(C[0], C[1] - 24, 24, 24, {
          stroke: "#f43f5e",
          strokeWidth: 2.5,
          seed: 105,
        });
      }
    }

    // ----------------------------------------------------
    // Section 2: Area Squares Proof (Progressive Drawing)
    // ----------------------------------------------------
    else if (currentSection.id === "section-2") {
      // Centered Triangle: C=(200, 220), B=(280, 220), A=(200, 140)
      const C: [number, number] = [200, 220];
      const B: [number, number] = [280, 220]; // leg a = 80
      const A: [number, number] = [200, 140]; // leg b = 80

      // Step 1: Draw Center Triangle
      const pTri = Math.min(1, Math.max(0, localFrame / 40));
      if (pTri > 0) {
        rc.polygon([C, B, A], {
          stroke: "#f8fafc",
          strokeWidth: 3,
          fill: "rgba(255, 255, 255, 0.1)",
          seed: 201,
        });
      }

      // Step 2: Dynamically Grow Square A (on bottom leg a)
      const pSqA = Math.min(1, Math.max(0, (localFrame - 50) / 70));
      if (pSqA > 0) {
        rc.rectangle(200, 220, 80, 80 * pSqA, {
          stroke: "#38bdf8",
          strokeWidth: 3,
          fill: "rgba(56, 189, 248, 0.25)",
          fillStyle: "hachure",
          seed: 202,
        });
      }

      // Step 3: Dynamically Grow Square B (on left leg b)
      const pSqB = Math.min(1, Math.max(0, (localFrame - 130) / 70));
      if (pSqB > 0) {
        const w = 80 * pSqB;
        rc.rectangle(200 - w, 140, w, 80, {
          stroke: "#818cf8",
          strokeWidth: 3,
          fill: "rgba(129, 140, 248, 0.25)",
          fillStyle: "hachure",
          seed: 203,
        });
      }

      // Step 4: Dynamically Grow Square C (on hypotenuse c)
      const pSqC = Math.min(1, Math.max(0, (localFrame - 210) / 90));
      if (pSqC > 0) {
        // Hypotenuse vector from A(200,140) to B(280,220): dx=80, dy=80
        // Perpendicular vector: (-80, 80) -> scaled by pSqC
        const P1: [number, number] = [200, 140];
        const P2: [number, number] = [280, 220];
        const P3: [number, number] = [280 + 80 * pSqC, 220 - 80 * pSqC];
        const P4: [number, number] = [200 + 80 * pSqC, 140 - 80 * pSqC];

        rc.polygon([P1, P2, P3, P4], {
          stroke: "#f59e0b",
          strokeWidth: 3.5,
          fill: "rgba(245, 158, 11, 0.3)",
          fillStyle: "hachure",
          seed: 204,
        });
      }
    }

    // ----------------------------------------------------
    // Section 3: Zhao Shuang Proof (Progressive 4 Triangles)
    // ----------------------------------------------------
    else if (currentSection.id === "section-3") {
      const size = 200;
      const ox = 140;
      const oy = 60;
      const a = 60;
      const b = 140;

      // Step 1: Draw Outer Big Square Boundary (c x c)
      const pOuter = Math.min(1, Math.max(0, localFrame / 50));
      if (pOuter > 0) {
        rc.rectangle(ox, oy, size * pOuter, size * pOuter, {
          stroke: "#f59e0b",
          strokeWidth: 3.5,
          seed: 301,
        });
      }

      // Step 2: Progressively add 4 Triangles one by one
      const t1: [number, number][] = [[ox, oy], [ox + b, oy], [ox, oy + a]];
      const t2: [number, number][] = [[ox + size, oy], [ox + size, oy + b], [ox + size - a, oy]];
      const t3: [number, number][] = [[ox + size, oy + size], [ox + a, oy + size], [ox + size, oy + size - a]];
      const t4: [number, number][] = [[ox, oy + size], [ox, oy + a], [ox + a, oy + size]];

      const allTriangles = [t1, t2, t3, t4];

      allTriangles.forEach((tPoints, idx) => {
        const pTri = Math.min(1, Math.max(0, (localFrame - 60 - idx * 45) / 35));
        if (pTri > 0) {
          // Animate triangle stroke/fill
          rc.polygon(tPoints, {
            stroke: "#38bdf8",
            strokeWidth: 2.5,
            fill: "rgba(56, 189, 248, 0.25)",
            fillStyle: "hachure",
            seed: 310 + idx,
          });
        }
      });

      // Step 3: Reveal Inner Small Square Hole (b - a)^2
      const pInner = Math.min(1, Math.max(0, (localFrame - 250) / 40));
      if (pInner > 0) {
        const ix = ox + a;
        const iy = oy + a;
        const isize = b - a; // 80

        rc.rectangle(ix, iy, isize * pInner, isize * pInner, {
          stroke: "#f43f5e",
          strokeWidth: 3,
          fill: "rgba(244, 63, 94, 0.4)",
          fillStyle: "solid",
          seed: 320,
        });
      }
    }

    // ----------------------------------------------------
    // Section 4: Garfield's Trapezoid Proof (Progressive)
    // ----------------------------------------------------
    else if (currentSection.id === "section-4") {
      const ox = 110;
      const oy = 270;
      const a = 80;
      const b = 140;

      const P1: [number, number] = [ox, oy];
      const P2: [number, number] = [ox + a + b, oy];
      const P3: [number, number] = [ox + a + b, oy - a];
      const P4: [number, number] = [ox, oy - b];
      const Mid: [number, number] = [ox + a, oy];

      // Step 1: Draw Outer Trapezoid boundary
      const pTrap = Math.min(1, Math.max(0, localFrame / 50));
      if (pTrap > 0) {
        rc.polygon([P1, P2, P3, P4], {
          stroke: "#818cf8",
          strokeWidth: 3.5,
          seed: 401,
        });
      }

      // Step 2: Draw Interior Partition Lines
      const pLine = Math.min(1, Math.max(0, (localFrame - 60) / 40));
      if (pLine > 0) {
        rc.line(Mid[0], Mid[1], P4[0], P4[1], {
          stroke: "#f59e0b",
          strokeWidth: 3,
          seed: 402,
        });
        rc.line(Mid[0], Mid[1], P3[0], P3[1], {
          stroke: "#f59e0b",
          strokeWidth: 3,
          seed: 403,
        });
      }

      // Step 3: Color Fill 3 Triangles
      const pFill = Math.min(1, Math.max(0, (localFrame - 120) / 40));
      if (pFill > 0) {
        // Triangle 1 (Left)
        rc.polygon([P1, Mid, P4], {
          stroke: "transparent",
          fill: "rgba(56, 189, 248, 0.25)",
          fillStyle: "hachure",
          seed: 404,
        });

        // Triangle 2 (Right)
        rc.polygon([Mid, P2, P3], {
          stroke: "transparent",
          fill: "rgba(129, 140, 248, 0.25)",
          fillStyle: "hachure",
          seed: 405,
        });

        // Triangle 3 (Middle Isosceles)
        rc.polygon([P4, Mid, P3], {
          stroke: "transparent",
          fill: "rgba(245, 158, 11, 0.3)",
          fillStyle: "hachure",
          seed: 406,
        });
      }
    }
  }, [localFrame, currentSection]);

  // Current Subtitle Cue
  const currentCue = subtitles.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "36px 60px",
        boxSizing: "border-box",
      }}
    >
      {/* Edge TTS Audio Track */}
      <Audio src={staticFile(audio.full)} volume={1.0} />

      {/* Header */}
      <header
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <BookOpen size={40} color="#38bdf8" />
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <Sparkles size={32} color="#f59e0b" />
        </div>

        {/* Section Tabs Progress Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "4px",
            background: "rgba(30, 41, 59, 0.8)",
            padding: "6px 18px",
            borderRadius: "50px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {sections.map((sec, idx) => {
            const isActive = sec.id === currentSection.id;
            const isPassed = frame >= sec.endFrame;

            return (
              <div
                key={sec.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "15px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? "#38bdf8"
                    : isPassed
                    ? "#818cf8"
                    : "#64748b",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: isActive
                    ? "rgba(56, 189, 248, 0.15)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(56, 189, 248, 0.4)"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {isPassed ? (
                  <CheckCircle2 size={15} color="#818cf8" />
                ) : (
                  <span>{idx + 1}.</span>
                )}
                <span>{sec.title.replace(/^\d+\.\s*/, "")}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Main Stage Content */}
      <main
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          display: "flex",
          width: "100%",
          maxWidth: "1400px",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          margin: "10px 0",
        }}
      >
        {/* RoughJS Geometry Canvas Card (Fixed Dimensions to Prevent Overflow) */}
        <div
          style={{
            position: "relative",
            background: "rgba(30, 41, 59, 0.85)",
            padding: "16px 24px",
            borderRadius: "24px",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={480} height={340} />
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "17px",
              fontWeight: 600,
              color: "#38bdf8",
            }}
          >
            {currentSection.title}
          </div>
        </div>

        {/* KaTeX Proof & Formula Explanation Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.95)",
            padding: "30px 45px",
            borderRadius: "24px",
            border: "2px solid #818cf8",
            boxShadow: "0 0 35px rgba(129, 140, 248, 0.3)",
            textAlign: "center",
            maxWidth: "580px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#c084fc",
              fontSize: "21px",
              fontWeight: 600,
            }}
          >
            <Calculator size={24} />
            <span>{currentSection.subtitle}</span>
          </div>

          {/* Math Formula Presentation */}
          <div style={{ fontSize: "38px", margin: "6px 0" }}>
            <BlockMath math={currentSection.formula || formula} />
          </div>

          {/* Explanation Text */}
          <div
            style={{
              fontSize: "19px",
              color: "#cbd5e1",
              lineHeight: 1.5,
            }}
          >
            {currentSection.id === "section-1" && (
              <>
                在直角三角形中，两条直角边 <InlineMath math="a" /> 与{" "}
                <InlineMath math="b" /> 的平方和，恒等于斜边{" "}
                <InlineMath math="c" /> 的平方。
              </>
            )}
            {currentSection.id === "section-2" && (
              <>
                直角边正方形面积 <InlineMath math="a^2" /> 与{" "}
                <InlineMath math="b^2" /> 面积相加，恰好等于斜边正方形面积{" "}
                <InlineMath math="c^2" />。
              </>
            )}
            {currentSection.id === "section-3" && (
              <>
                展开式：<InlineMath math="2ab + (b-a)^2 = 2ab + b^2 - 2ab + a^2 = a^2 + b^2 = c^2" />
              </>
            )}
            {currentSection.id === "section-4" && (
              <>
                展开式：<InlineMath math="\frac{1}{2}(a^2+2ab+b^2) = ab + \frac{1}{2}c^2 \Longrightarrow a^2+b^2=c^2" />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Subtitles Bar Overlay */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          minHeight: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          padding: "10px 24px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Volume2 size={24} color="#38bdf8" />
        <span
          style={{
            color: "#f8fafc",
            fontSize: "21px",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {currentCue ? currentCue.text : "..."}
        </span>
      </div>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: "15px",
          color: "#64748b",
          paddingTop: "6px",
        }}
      >
        MathLogic 3-Proofs Animation • Section: {currentSectionIdx + 1} / 4 • Frame: {frame} / {durationInFrames}
      </footer>
    </AbsoluteFill>
  );
};
