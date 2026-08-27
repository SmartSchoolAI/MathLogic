import React, { useEffect, useRef } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import rough from "roughjs";
import { Sparkles, Calculator, BookOpen } from "lucide-react";

export interface MathLessonProps {
  title?: string;
  formula?: string;
}

export const MathLesson: React.FC<MathLessonProps> = ({
  title = "勾股定理 (Pythagorean Theorem)",
  formula = "a^2 + b^2 = c^2",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Remotion Spring Animation for Title
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [-100, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Formula Fade-In & Scale
  const formulaSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14 },
  });

  const formulaScale = interpolate(formulaSpring, [0, 1], [0.5, 1]);
  const formulaOpacity = interpolate(formulaSpring, [0, 1], [0, 1]);

  // RoughJS Canvas drawing for Right Triangle
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    // Progressive stroke animation based on frame
    const progress = Math.min(1, Math.max(0, (frame - 60) / 60));
    if (progress > 0) {
      // Draw Right Triangle
      const p1 = [60, 240];
      const p2 = [260, 240];
      const p3 = [60, 60];

      rc.polygon(
        [
          p1 as [number, number],
          [p1[0] + (p2[0] - p1[0]) * progress, p1[1]] as [number, number],
          [p1[0], p1[1] + (p3[1] - p1[1]) * progress] as [number, number],
        ],
        {
          stroke: "#38bdf8",
          strokeWidth: 4,
          roughness: 1.5,
          fill: progress >= 1 ? "rgba(56, 189, 248, 0.15)" : undefined,
          fillStyle: "hachure",
        }
      );

      // Right angle symbol
      if (progress >= 1) {
        rc.rectangle(60, 215, 25, 25, {
          stroke: "#f43f5e",
          strokeWidth: 2,
        });
      }
    }
  }, [frame]);

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
        padding: "60px 80px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <BookOpen size={48} color="#38bdf8" />
        <h1
          style={{
            fontSize: "56px",
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
      </header>

      {/* Main Content Area */}
      <main
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "1400px",
          alignItems: "center",
          justifyContent: "space-around",
          margin: "40px 0",
        }}
      >
        {/* RoughJS Triangle Canvas */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            padding: "24px",
            borderRadius: "24px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <canvas ref={canvasRef} width={320} height={300} />
          <div
            style={{
              marginTop: "12px",
              fontSize: "20px",
              color: "#94a3b8",
            }}
          >
            直角三角形几何示意图 (RoughJS Canvas)
          </div>
        </div>

        {/* KaTeX Formula Box */}
        <div
          style={{
            transform: `scale(${formulaScale})`,
            opacity: formulaOpacity,
            background: "rgba(30, 41, 59, 0.9)",
            padding: "40px 60px",
            borderRadius: "24px",
            border: "2px solid #818cf8",
            boxShadow: "0 0 40px rgba(129, 140, 248, 0.3)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "20px",
              color: "#c084fc",
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            <Calculator size={28} />
            <span>核心公式</span>
          </div>

          <div style={{ fontSize: "48px" }}>
            <BlockMath math={formula} />
          </div>

          <div
            style={{
              marginTop: "24px",
              fontSize: "22px",
              color: "#cbd5e1",
            }}
          >
            其中 <InlineMath math="a" /> 与 <InlineMath math="b" /> 为直角边，
            <InlineMath math="c" /> 为斜边。
          </div>
        </div>
      </main>

      {/* Footer / Subtitle Progress */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: "20px",
          color: "#64748b",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "20px",
        }}
      >
        MathLogic Remotion Animation • Frame: {frame} / 300
      </footer>
    </AbsoluteFill>
  );
};
