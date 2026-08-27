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
  const cardScale = interpolate(cardSpring, [0, 1], [0.95, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // RoughJS Multi-Proof Progressive Geometry Canvas Renderer (With Explicit ABC & Area Labels)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    // ----------------------------------------------------
    // Section 1: Basic Definition (With A, B, C & a, b, c)
    // ----------------------------------------------------
    if (currentSection.id === "section-1") {
      const C: [number, number] = [120, 360];
      const B: [number, number] = [520, 360]; // base = 400
      const A: [number, number] = [120, 80];  // height = 280

      // Dotted skeleton outline
      rc.polygon([C, B, A], {
        stroke: "rgba(148, 163, 184, 0.3)",
        strokeWidth: 3,
        strokeLineDash: [10, 8],
        seed: 999,
      });

      // Step 1: Edge a (Bottom)
      const pA = Math.min(1, Math.max(0, (localFrame - 15) / 35));
      if (pA > 0) {
        rc.line(C[0], C[1], C[0] + (B[0] - C[0]) * pA, C[1], {
          stroke: "#38bdf8",
          strokeWidth: 5,
          seed: 101,
        });
      }

      // Step 2: Edge b (Left vertical)
      const pB = Math.min(1, Math.max(0, (localFrame - 50) / 35));
      if (pB > 0) {
        rc.line(C[0], C[1], C[0], C[1] + (A[1] - C[1]) * pB, {
          stroke: "#818cf8",
          strokeWidth: 5,
          seed: 102,
        });
      }

      // Step 3: Edge c (Hypotenuse)
      const pC = Math.min(1, Math.max(0, (localFrame - 85) / 35));
      if (pC > 0) {
        rc.line(A[0], A[1], A[0] + (B[0] - A[0]) * pC, A[1] + (B[1] - A[1]) * pC, {
          stroke: "#f59e0b",
          strokeWidth: 6,
          seed: 103,
        });
      }

      // Fill & Right angle marker
      if (pC >= 1) {
        rc.polygon([C, B, A], {
          stroke: "transparent",
          fill: "rgba(56, 189, 248, 0.18)",
          fillStyle: "hachure",
          seed: 104,
        });
        rc.rectangle(C[0], C[1] - 32, 32, 32, {
          stroke: "#f43f5e",
          strokeWidth: 3,
          seed: 105,
        });
      }
    }

    // ----------------------------------------------------
    // Section 2: Area Squares Proof (a^2 + b^2 = c^2 Visual Merge)
    // ----------------------------------------------------
    else if (currentSection.id === "section-2") {
      const C: [number, number] = [270, 290];
      const B: [number, number] = [380, 290];
      const A: [number, number] = [270, 180];

      // Draw Center Triangle
      rc.polygon([C, B, A], {
        stroke: "#f8fafc",
        strokeWidth: 3.5,
        fill: "rgba(255, 255, 255, 0.12)",
        seed: 201,
      });

      // Square A (on bottom leg a)
      const pSqA = Math.min(1, Math.max(0, (localFrame - 50) / 70));
      if (pSqA > 0) {
        rc.rectangle(270, 290, 110, 110 * pSqA, {
          stroke: "#38bdf8",
          strokeWidth: 3.5,
          fill: "rgba(56, 189, 248, 0.3)",
          fillStyle: "hachure",
          seed: 202,
        });
      }

      // Square B (on left leg b)
      const pSqB = Math.min(1, Math.max(0, (localFrame - 130) / 70));
      if (pSqB > 0) {
        const w = 110 * pSqB;
        rc.rectangle(270 - w, 180, w, 110, {
          stroke: "#818cf8",
          strokeWidth: 3.5,
          fill: "rgba(129, 140, 248, 0.3)",
          fillStyle: "hachure",
          seed: 203,
        });
      }

      // Square C (on hypotenuse c)
      const pSqC = Math.min(1, Math.max(0, (localFrame - 210) / 90));
      if (pSqC > 0) {
        const P1: [number, number] = [270, 180];
        const P2: [number, number] = [380, 290];
        const P3: [number, number] = [380 + 110 * pSqC, 290 - 110 * pSqC];
        const P4: [number, number] = [270 + 110 * pSqC, 180 - 110 * pSqC];

        rc.polygon([P1, P2, P3, P4], {
          stroke: "#f59e0b",
          strokeWidth: 4,
          fill: "rgba(245, 158, 11, 0.35)",
          fillStyle: "hachure",
          seed: 204,
        });
      }
    }

    // ----------------------------------------------------
    // Section 3: Zhao Shuang Proof (4 Triangles + Inner (b-a)^2)
    // ----------------------------------------------------
    else if (currentSection.id === "section-3") {
      const size = 300;
      const ox = 180;
      const oy = 75;
      const a = 90;
      const b = 210;

      // Outer Big Square c x c
      const pOuter = Math.min(1, Math.max(0, localFrame / 50));
      if (pOuter > 0) {
        rc.rectangle(ox, oy, size * pOuter, size * pOuter, {
          stroke: "#f59e0b",
          strokeWidth: 4,
          seed: 301,
        });
      }

      // 4 Triangles
      const t1: [number, number][] = [[ox, oy], [ox + b, oy], [ox, oy + a]];
      const t2: [number, number][] = [[ox + size, oy], [ox + size, oy + b], [ox + size - a, oy]];
      const t3: [number, number][] = [[ox + size, oy + size], [ox + a, oy + size], [ox + size, oy + size - a]];
      const t4: [number, number][] = [[ox, oy + size], [ox, oy + a], [ox + a, oy + size]];

      [t1, t2, t3, t4].forEach((tPoints, idx) => {
        const pTri = Math.min(1, Math.max(0, (localFrame - 60 - idx * 45) / 35));
        if (pTri > 0) {
          rc.polygon(tPoints, {
            stroke: "#38bdf8",
            strokeWidth: 3,
            fill: "rgba(56, 189, 248, 0.3)",
            fillStyle: "hachure",
            seed: 310 + idx,
          });
        }
      });

      // Inner Hole Square (b-a)^2
      const pInner = Math.min(1, Math.max(0, (localFrame - 250) / 40));
      if (pInner > 0) {
        const ix = ox + a;
        const iy = oy + a;
        const isize = b - a; // 120

        rc.rectangle(ix, iy, isize * pInner, isize * pInner, {
          stroke: "#f43f5e",
          strokeWidth: 3.5,
          fill: "rgba(244, 63, 94, 0.45)",
          fillStyle: "solid",
          seed: 320,
        });
      }
    }

    // ----------------------------------------------------
    // Section 4: Garfield's Trapezoid Proof
    // ----------------------------------------------------
    else if (currentSection.id === "section-4") {
      const ox = 150;
      const oy = 380;
      const a = 120;
      const b = 210;

      const P1: [number, number] = [ox, oy];
      const P2: [number, number] = [ox + a + b, oy];
      const P3: [number, number] = [ox + a + b, oy - a];
      const P4: [number, number] = [ox, oy - b];
      const Mid: [number, number] = [ox + a, oy];

      const pTrap = Math.min(1, Math.max(0, localFrame / 50));
      if (pTrap > 0) {
        rc.polygon([P1, P2, P3, P4], {
          stroke: "#818cf8",
          strokeWidth: 4,
          seed: 401,
        });
      }

      const pLine = Math.min(1, Math.max(0, (localFrame - 60) / 40));
      if (pLine > 0) {
        rc.line(Mid[0], Mid[1], P4[0], P4[1], {
          stroke: "#f59e0b",
          strokeWidth: 3.5,
          seed: 402,
        });
        rc.line(Mid[0], Mid[1], P3[0], P3[1], {
          stroke: "#f59e0b",
          strokeWidth: 3.5,
          seed: 403,
        });
      }

      const pFill = Math.min(1, Math.max(0, (localFrame - 120) / 40));
      if (pFill > 0) {
        rc.polygon([P1, Mid, P4], {
          stroke: "transparent",
          fill: "rgba(56, 189, 248, 0.3)",
          fillStyle: "hachure",
          seed: 404,
        });
        rc.polygon([Mid, P2, P3], {
          stroke: "transparent",
          fill: "rgba(129, 140, 248, 0.3)",
          fillStyle: "hachure",
          seed: 405,
        });
        rc.polygon([P4, Mid, P3], {
          stroke: "transparent",
          fill: "rgba(245, 158, 11, 0.35)",
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
        padding: "24px 40px",
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
          gap: "12px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <BookOpen size={48} color="#38bdf8" />
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <Sparkles size={40} color="#f59e0b" />
        </div>

        {/* Section Tabs Progress Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "4px",
            background: "rgba(30, 41, 59, 0.9)",
            padding: "10px 28px",
            borderRadius: "50px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
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
                  gap: "8px",
                  fontSize: "20px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? "#38bdf8"
                    : isPassed
                    ? "#818cf8"
                    : "#94a3b8",
                  padding: "6px 16px",
                  borderRadius: "24px",
                  background: isActive
                    ? "rgba(56, 189, 248, 0.2)"
                    : "transparent",
                  border: isActive
                    ? "2px solid #38bdf8"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {isPassed ? (
                  <CheckCircle2 size={20} color="#818cf8" />
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
          maxWidth: "1720px",
          alignItems: "center",
          justifyContent: "center",
          gap: "50px",
          margin: "10px 0",
        }}
      >
        {/* RoughJS Geometry Canvas Card with Explicit ABC / Edge / Area Overlays */}
        <div
          style={{
            position: "relative",
            background: "rgba(30, 41, 59, 0.9)",
            padding: "20px 28px",
            borderRadius: "28px",
            border: "2px solid rgba(56, 189, 248, 0.4)",
            boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={660} height={450} />

            {/* Overlays for Section 1 (Definition) */}
            {currentSection.id === "section-1" && (
              <>
                <div style={{ position: "absolute", left: "95px", bottom: "75px", color: "#f8fafc", fontSize: "22px", fontWeight: 800 }}>C</div>
                <div style={{ position: "absolute", left: "530px", bottom: "75px", color: "#f8fafc", fontSize: "22px", fontWeight: 800 }}>B</div>
                <div style={{ position: "absolute", left: "95px", top: "60px", color: "#f8fafc", fontSize: "22px", fontWeight: 800 }}>A</div>

                <div style={{ position: "absolute", left: "310px", bottom: "60px", color: "#38bdf8", fontSize: "28px", fontWeight: 800 }}><InlineMath math="a" /></div>
                <div style={{ position: "absolute", left: "75px", top: "210px", color: "#818cf8", fontSize: "28px", fontWeight: 800 }}><InlineMath math="b" /></div>
                <div style={{ position: "absolute", left: "330px", top: "190px", color: "#f59e0b", fontSize: "30px", fontWeight: 800 }}><InlineMath math="c" /></div>
              </>
            )}

            {/* Overlays for Section 2 (Area Squares) */}
            {currentSection.id === "section-2" && (
              <>
                <div style={{ position: "absolute", left: "305px", bottom: "100px", color: "#38bdf8", fontSize: "24px", fontWeight: 800 }}><InlineMath math="Area = a^2" /></div>
                <div style={{ position: "absolute", left: "175px", top: "210px", color: "#818cf8", fontSize: "24px", fontWeight: 800 }}><InlineMath math="Area = b^2" /></div>
                <div style={{ position: "absolute", left: "380px", top: "160px", color: "#f59e0b", fontSize: "26px", fontWeight: 800 }}><InlineMath math="Area = c^2" /></div>
              </>
            )}

            {/* Overlays for Section 3 (Zhao Shuang) */}
            {currentSection.id === "section-3" && (
              <>
                <div style={{ position: "absolute", left: "310px", top: "45px", color: "#f59e0b", fontSize: "24px", fontWeight: 800 }}><InlineMath math="c" /></div>
                <div style={{ position: "absolute", left: "310px", top: "205px", color: "#f43f5e", fontSize: "22px", fontWeight: 800 }}><InlineMath math="(b-a)^2" /></div>
              </>
            )}

            {/* Overlays for Section 4 (Garfield Trapezoid) */}
            {currentSection.id === "section-4" && (
              <>
                <div style={{ position: "absolute", left: "200px", bottom: "40px", color: "#38bdf8", fontSize: "24px", fontWeight: 800 }}><InlineMath math="a" /></div>
                <div style={{ position: "absolute", left: "360px", bottom: "40px", color: "#818cf8", fontSize: "24px", fontWeight: 800 }}><InlineMath math="b" /></div>
                <div style={{ position: "absolute", left: "280px", top: "220px", color: "#f59e0b", fontSize: "26px", fontWeight: 800 }}><InlineMath math="c" /></div>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "22px",
              fontWeight: 700,
              color: "#38bdf8",
            }}
          >
            {currentSection.title}
          </div>
        </div>

        {/* KaTeX Proof & Formula Step-by-Step Cancellation Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.95)",
            padding: "40px 52px",
            borderRadius: "28px",
            border: "2px solid #818cf8",
            boxShadow: "0 0 45px rgba(129, 140, 248, 0.35)",
            textAlign: "center",
            maxWidth: "820px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#c084fc",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            <Calculator size={32} />
            <span>{currentSection.subtitle}</span>
          </div>

          {/* Dynamic Step-by-Step Proof Expressions with Red Cancellation Lines */}
          <div style={{ fontSize: "38px", margin: "8px 0", minHeight: "130px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {currentSection.id === "section-1" && (
              <BlockMath math="a^2 + b^2 = c^2" />
            )}

            {currentSection.id === "section-2" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <BlockMath math="\text{Area}(a^2) + \text{Area}(b^2) = \text{Area}(c^2)" />
                <div style={{ fontSize: "28px", color: "#38bdf8" }}>
                  <InlineMath math="a^2 + b^2 = c^2" />
                </div>
              </div>
            )}

            {currentSection.id === "section-3" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "36px" }}>
                  <BlockMath math="c^2 = 4 \times (\frac{1}{2}ab) + (b-a)^2" />
                </div>
                <div style={{ fontSize: "32px", color: "#f43f5e", fontWeight: 700 }}>
                  <InlineMath math="c^2 = 2ab + b^2 - 2ab + a^2" />
                </div>
                <div style={{ fontSize: "34px", color: "#38bdf8", fontWeight: 800 }}>
                  <InlineMath math="\Longrightarrow a^2 + b^2 = c^2 \quad (\text{2ab相互抵消!})" />
                </div>
              </div>
            )}

            {currentSection.id === "section-4" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "36px" }}>
                  <BlockMath math="\frac{1}{2}(a+b)^2 = 2 \times (\frac{1}{2}ab) + \frac{1}{2}c^2" />
                </div>
                <div style={{ fontSize: "32px", color: "#f43f5e", fontWeight: 700 }}>
                  <InlineMath math="\frac{1}{2}a^2 + ab + \frac{1}{2}b^2 = ab + \frac{1}{2}c^2" />
                </div>
                <div style={{ fontSize: "34px", color: "#38bdf8", fontWeight: 800 }}>
                  <InlineMath math="\Longrightarrow a^2 + b^2 = c^2 \quad (\text{两侧消去ab, 同乘2!})" />
                </div>
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <div
            style={{
              fontSize: "23px",
              color: "#cbd5e1",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {currentSection.id === "section-1" && (
              <>
                直角顶点为 <InlineMath math="C" />，直角边分别为 <InlineMath math="a" /> 与 <InlineMath math="b" />，斜边为 <InlineMath math="c" />。
              </>
            )}
            {currentSection.id === "section-2" && (
              <>
                直角边正方形 <InlineMath math="a^2" /> 与 <InlineMath math="b^2" /> 面积拼合无缝填满斜边正方形 <InlineMath math="c^2" />。
              </>
            )}
            {currentSection.id === "section-3" && (
              <>
                四个三角形面积 <InlineMath math="2ab" /> 与小正方形展开式的 <InlineMath math="-2ab" /> 精准抵消！
              </>
            )}
            {currentSection.id === "section-4" && (
              <>
                梯形展开式左右两侧的 <InlineMath math="ab" /> 完全相减消去，两边同时乘以 2 即得 <InlineMath math="a^2+b^2=c^2" />！
              </>
            )}
          </div>
        </div>
      </main>

      {/* Subtitles Bar Overlay */}
      <div
        style={{
          width: "100%",
          maxWidth: "1650px",
          minHeight: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          padding: "12px 36px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Volume2 size={32} color="#38bdf8" />
        <span
          style={{
            color: "#f8fafc",
            fontSize: "28px",
            fontWeight: 700,
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
          fontSize: "18px",
          color: "#64748b",
          paddingTop: "6px",
        }}
      >
        MathLogic 3-Proofs Animation • Section: {currentSectionIdx + 1} / 4 • Frame: {frame} / {durationInFrames}
      </footer>
    </AbsoluteFill>
  );
};
