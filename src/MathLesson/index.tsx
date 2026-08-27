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
import { Sparkles, Calculator, BookOpen, Volume2, CheckCircle2, Activity } from "lucide-react";

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
      const B: [number, number] = [520, 360];
      const A: [number, number] = [120, 80];

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

      // Step 4: Fill & Right angle marker
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
    // Section 2: Rearrangement Proof (TED-Ed Screenshot 1)
    // ----------------------------------------------------
    else if (currentSection.id === "section-2") {
      const size = 260;
      const a = 80;
      const b = 180;

      const ox1 = 30;
      const oy1 = 80;

      const ox2 = 370;
      const oy2 = 80;

      const p1 = Math.min(1, Math.max(0, localFrame / 40));
      const p2 = Math.min(1, Math.max(0, (localFrame - 60) / 60));

      if (p1 > 0) {
        rc.rectangle(ox1, oy1, size, size, {
          stroke: "#f8fafc",
          strokeWidth: 3.5,
          seed: 201,
        });
      }

      if (p2 > 0) {
        const t1: [number, number][] = [[ox1, oy1], [ox1 + b, oy1], [ox1, oy1 + a]];
        const t2: [number, number][] = [[ox1 + size, oy1], [ox1 + size, oy1 + b], [ox1 + size - a, oy1]];
        const t3: [number, number][] = [[ox1 + size, oy1 + size], [ox1 + a, oy1 + size], [ox1 + size, oy1 + size - a]];
        const t4: [number, number][] = [[ox1, oy1 + size], [ox1, oy1 + a], [ox1 + a, oy1 + size]];

        [t1, t2, t3, t4].forEach((pts, i) => {
          rc.polygon(pts, {
            stroke: "#38bdf8",
            strokeWidth: 2.5,
            fill: "rgba(56, 189, 248, 0.25)",
            fillStyle: "hachure",
            seed: 210 + i,
          });
        });

        // Center Red Square c^2
        rc.polygon(
          [
            [ox1 + b, oy1],
            [ox1 + size, oy1 + b],
            [ox1 + a, oy1 + size],
            [ox1, oy1 + a],
          ],
          {
            stroke: "#f43f5e",
            strokeWidth: 4,
            fill: "rgba(244, 63, 94, 0.45)",
            fillStyle: "solid",
            seed: 220,
          }
        );
      }

      if (p2 > 0.5) {
        rc.rectangle(ox2, oy2, size, size, {
          stroke: "#f8fafc",
          strokeWidth: 3.5,
          seed: 230,
        });

        rc.polygon([[ox2 + b, oy2], [ox2 + size, oy2], [ox2 + size, oy2 + a]], { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)", fillStyle: "hachure", seed: 231 });
        rc.polygon([[ox2 + b, oy2], [ox2 + b, oy2 + a], [ox2 + size, oy2 + a]], { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)", fillStyle: "hachure", seed: 232 });

        rc.polygon([[ox2, oy2 + b], [ox2 + a, oy2 + b], [ox2, oy2 + size]], { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)", fillStyle: "hachure", seed: 233 });
        rc.polygon([[ox2 + a, oy2 + b], [ox2 + a, oy2 + size], [ox2, oy2 + size]], { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)", fillStyle: "hachure", seed: 234 });

        // Remaining Square b^2
        rc.rectangle(ox2, oy2, b, b, {
          stroke: "#818cf8",
          strokeWidth: 3.5,
          fill: "rgba(129, 140, 248, 0.35)",
          fillStyle: "hachure",
          seed: 240,
        });

        // Remaining Square a^2
        rc.rectangle(ox2 + b, oy2 + b, a, a, {
          stroke: "#38bdf8",
          strokeWidth: 3.5,
          fill: "rgba(56, 189, 248, 0.4)",
          fillStyle: "hachure",
          seed: 241,
        });
      }
    }

    // ----------------------------------------------------
    // Section 3: Similarity Proof (TED-Ed Screenshot 2)
    // ----------------------------------------------------
    else if (currentSection.id === "section-3") {
      const pSim = Math.min(1, Math.max(0, localFrame / 40));

      if (pSim > 0) {
        const B1: [number, number] = [60, 100];
        const A1: [number, number] = [60, 360];
        const C1: [number, number] = [260, 360];
        const D1: [number, number] = [140, 256];

        rc.polygon([B1, A1, C1], {
          stroke: "#38bdf8",
          strokeWidth: 3.5,
          fill: "rgba(56, 189, 248, 0.15)",
          seed: 301,
        });

        rc.line(A1[0], A1[1], D1[0], D1[1], {
          stroke: "#f43f5e",
          strokeWidth: 3.5,
          seed: 302,
        });

        rc.rectangle(60, 335, 25, 25, { stroke: "#f43f5e", strokeWidth: 2, seed: 303 });
      }

      const pSub = Math.min(1, Math.max(0, (localFrame - 60) / 40));

      if (pSub > 0) {
        const B2: [number, number] = [320, 140];
        const D2: [number, number] = [320, 360];
        const A2: [number, number] = [430, 360];

        rc.polygon([B2, D2, A2], {
          stroke: "#818cf8",
          strokeWidth: 3.5,
          fill: "rgba(129, 140, 248, 0.25)",
          seed: 310,
        });
        rc.rectangle(320, 335, 25, 25, { stroke: "#f43f5e", strokeWidth: 2, seed: 311 });

        const A3: [number, number] = [490, 200];
        const D3: [number, number] = [490, 360];
        const C3: [number, number] = [610, 360];

        rc.polygon([A3, D3, C3], {
          stroke: "#f59e0b",
          strokeWidth: 3.5,
          fill: "rgba(245, 158, 11, 0.25)",
          seed: 320,
        });
        rc.rectangle(490, 335, 25, 25, { stroke: "#f43f5e", strokeWidth: 2, seed: 321 });
      }
    }

    // ----------------------------------------------------
    // Section 4: Zhao Shuang Proof
    // ----------------------------------------------------
    else if (currentSection.id === "section-4") {
      const size = 300;
      const ox = 180;
      const oy = 75;
      const a = 90;
      const b = 210;

      const pOuter = Math.min(1, Math.max(0, localFrame / 50));
      if (pOuter > 0) {
        rc.rectangle(ox, oy, size * pOuter, size * pOuter, {
          stroke: "#f59e0b",
          strokeWidth: 4,
          seed: 401,
        });
      }

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
            seed: 410 + idx,
          });
        }
      });

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
          seed: 420,
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
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
        backgroundSize: "36px 36px",
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
            backdropFilter: "blur(8px)",
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
        {/* RoughJS Geometry Canvas Card with Overlays */}
        <div
          style={{
            position: "relative",
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(12px)",
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
                <div style={{ position: "absolute", left: "95px", bottom: "75px", color: "#f8fafc", fontSize: "22px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 8px", borderRadius: "6px" }}>C</div>
                <div style={{ position: "absolute", left: "530px", bottom: "75px", color: "#f8fafc", fontSize: "22px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 8px", borderRadius: "6px" }}>B</div>
                <div style={{ position: "absolute", left: "95px", top: "60px", color: "#f8fafc", fontSize: "22px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 8px", borderRadius: "6px" }}>A</div>

                <div style={{ position: "absolute", left: "310px", bottom: "55px", color: "#38bdf8", fontSize: "26px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 10px", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.4)" }}><InlineMath math="a" /></div>
                <div style={{ position: "absolute", left: "65px", top: "210px", color: "#818cf8", fontSize: "26px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 10px", borderRadius: "8px", border: "1px solid rgba(129, 140, 248, 0.4)" }}><InlineMath math="b" /></div>
                <div style={{ position: "absolute", left: "330px", top: "190px", color: "#f59e0b", fontSize: "28px", fontWeight: 800, background: "rgba(15, 23, 42, 0.7)", padding: "2px 10px", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.4)" }}><InlineMath math="c" /></div>
              </>
            )}

            {/* Overlays for Section 2 (TED-Ed Rearrangement Proof, Screenshot 1) */}
            {currentSection.id === "section-2" && (
              <>
                <div style={{ position: "absolute", left: "135px", top: "185px", color: "#f8fafc", fontSize: "40px", fontWeight: 900, textShadow: "0 0 12px rgba(0,0,0,0.9)", background: "rgba(244, 63, 94, 0.6)", padding: "4px 14px", borderRadius: "12px", border: "2px solid #f43f5e" }}>
                  <InlineMath math="c^2" />
                </div>

                <div style={{ position: "absolute", left: "312px", top: "180px", color: "#f59e0b", fontSize: "52px", fontWeight: 900, textShadow: "0 0 15px rgba(245, 158, 11, 0.8)" }}>
                  =
                </div>

                <div style={{ position: "absolute", left: "445px", top: "145px", color: "#f8fafc", fontSize: "38px", fontWeight: 900, background: "rgba(129, 140, 248, 0.5)", padding: "4px 12px", borderRadius: "10px" }}>
                  <InlineMath math="b^2" />
                </div>

                <div style={{ position: "absolute", left: "575px", top: "295px", color: "#f8fafc", fontSize: "30px", fontWeight: 900, background: "rgba(56, 189, 248, 0.5)", padding: "4px 10px", borderRadius: "8px" }}>
                  <InlineMath math="a^2" />
                </div>
              </>
            )}

            {/* Overlays for Section 3 (TED-Ed Similarity Proof, Screenshot 2) */}
            {currentSection.id === "section-3" && (
              <>
                <div style={{ position: "absolute", left: "40px", top: "75px", color: "#38bdf8", fontSize: "22px", fontWeight: 800 }}>B</div>
                <div style={{ position: "absolute", left: "35px", bottom: "75px", color: "#38bdf8", fontSize: "22px", fontWeight: 800 }}>A</div>
                <div style={{ position: "absolute", left: "265px", bottom: "75px", color: "#38bdf8", fontSize: "22px", fontWeight: 800 }}>C</div>
                <div style={{ position: "absolute", left: "145px", top: "235px", color: "#f43f5e", fontSize: "22px", fontWeight: 800 }}>D</div>

                <div style={{ position: "absolute", left: "315px", top: "115px", color: "#818cf8", fontSize: "20px", fontWeight: 800 }}>B</div>
                <div style={{ position: "absolute", left: "310px", bottom: "75px", color: "#818cf8", fontSize: "20px", fontWeight: 800 }}>D</div>
                <div style={{ position: "absolute", left: "435px", bottom: "75px", color: "#818cf8", fontSize: "20px", fontWeight: 800 }}>A</div>

                <div style={{ position: "absolute", left: "485px", top: "175px", color: "#f59e0b", fontSize: "20px", fontWeight: 800 }}>A</div>
                <div style={{ position: "absolute", left: "480px", bottom: "75px", color: "#f59e0b", fontSize: "20px", fontWeight: 800 }}>D</div>
                <div style={{ position: "absolute", left: "615px", bottom: "75px", color: "#f59e0b", fontSize: "20px", fontWeight: 800 }}>C</div>
              </>
            )}

            {/* Overlays for Section 4 (Zhao Shuang) */}
            {currentSection.id === "section-4" && (
              <>
                <div style={{ position: "absolute", left: "310px", top: "45px", color: "#f59e0b", fontSize: "24px", fontWeight: 800 }}><InlineMath math="c" /></div>
                <div style={{ position: "absolute", left: "310px", top: "205px", color: "#f43f5e", fontSize: "22px", fontWeight: 800 }}><InlineMath math="(b-a)^2" /></div>
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

        {/* KaTeX Proof & Formula Step-by-Step Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.95)",
            backdropFilter: "blur(12px)",
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

          {/* Dynamic Step-by-Step Proof Equations matched with TED-Ed Screenshots */}
          <div style={{ fontSize: "38px", margin: "8px 0", minHeight: "130px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {currentSection.id === "section-1" && (
              <BlockMath math="a^2 + b^2 = c^2" />
            )}

            {currentSection.id === "section-2" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <BlockMath math="(a+b)^2 - 4 \times (\frac{1}{2}ab) = c^2" />
                <div style={{ fontSize: "32px", color: "#f43f5e", fontWeight: 700 }}>
                  <InlineMath math="a^2 + 2ab + b^2 - 2ab = c^2" />
                </div>
                <div style={{ fontSize: "34px", color: "#38bdf8", fontWeight: 800 }}>
                  <InlineMath math="\Longrightarrow c^2 = a^2 + b^2 \quad (\text{减去相同4个三角形!})" />
                </div>
              </div>
            )}

            {currentSection.id === "section-3" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "32px", color: "#38bdf8" }}>
                  <InlineMath math="\frac{AB}{BD} = \frac{BC}{AB} \Rightarrow AB^2 = BC \times BD" />
                </div>
                <div style={{ fontSize: "32px", color: "#818cf8" }}>
                  <InlineMath math="\frac{AC}{CD} = \frac{BC}{AC} \Rightarrow AC^2 = BC \times CD" />
                </div>
                <div style={{ fontSize: "34px", color: "#f59e0b", fontWeight: 800 }}>
                  <InlineMath math="AB^2 + AC^2 = BC(BD + CD) = BC^2" />
                </div>
              </div>
            )}

            {currentSection.id === "section-4" && (
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
                直角顶点为 <InlineMath math="A" />，直角边分别为 <InlineMath math="a" /> 与 <InlineMath math="b" />，斜边为 <InlineMath math="c" />。
              </>
            )}
            {currentSection.id === "section-2" && (
              <>
                两个大正方形总面积完全相同，各减去四个直角三角形后，剩余的 <InlineMath math="c^2" /> 必定等于 <InlineMath math="a^2 + b^2" />！
              </>
            )}
            {currentSection.id === "section-3" && (
              <>
                高 <InlineMath math="AD" /> 将原三角形分割为两个相似三角形，由相似边长比例两式相加得 <InlineMath math="AB^2 + AC^2 = BC^2" />。
              </>
            )}
            {currentSection.id === "section-4" && (
              <>
                四个三角形面积 <InlineMath math="2ab" /> 与小正方形展开式的 <InlineMath math="-2ab" /> 精准抵消！
              </>
            )}
          </div>
        </div>
      </main>

      {/* Subtitles Bar Overlay with Audio Waves Equalizer Indicator */}
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
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          padding: "12px 36px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Volume2 size={32} color="#38bdf8" />
          <Activity size={24} color="#818cf8" style={{ opacity: 0.8 }} />
        </div>
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
        MathLogic TED-Ed Proofs Animation • Section: {currentSectionIdx + 1} / 4 • Frame: {frame} / {durationInFrames}
      </footer>
    </AbsoluteFill>
  );
};
