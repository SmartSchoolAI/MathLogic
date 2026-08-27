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

  // RoughJS Canvas drawing for Right Triangle (Flicker-Free with fixed seeds)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    // Triangle vertices
    // C is right angle (80, 240), B is right vertex (320, 240), A is top vertex (80, 60)
    const C: [number, number] = [80, 240];
    const B: [number, number] = [300, 240];
    const A: [number, number] = [80, 60];

    // Progressive animation timeline
    // 1. Draw base edge a (C -> B): Frame 40 -> 65
    // 2. Draw height edge b (C -> A): Frame 65 -> 90
    // 3. Draw hypotenuse c (A -> B): Frame 90 -> 115
    const progressA = Math.min(1, Math.max(0, (frame - 40) / 25));
    const progressB = Math.min(1, Math.max(0, (frame - 65) / 25));
    const progressC = Math.min(1, Math.max(0, (frame - 90) / 25));

    // Edge a (Bottom: C -> B)
    if (progressA > 0) {
      const currentB: [number, number] = [
        C[0] + (B[0] - C[0]) * progressA,
        C[1],
      ];
      rc.line(C[0], C[1], currentB[0], currentB[1], {
        stroke: "#38bdf8",
        strokeWidth: 3.5,
        roughness: 1.0,
        seed: 101, // Fixed seed prevents flickering across frames
      });
    }

    // Edge b (Left vertical: C -> A)
    if (progressB > 0) {
      const currentA: [number, number] = [
        C[0],
        C[1] + (A[1] - C[1]) * progressB,
      ];
      rc.line(C[0], C[1], currentA[0], currentA[1], {
        stroke: "#818cf8",
        strokeWidth: 3.5,
        roughness: 1.0,
        seed: 102, // Fixed seed
      });
    }

    // Edge c (Hypotenuse: A -> B)
    if (progressC > 0) {
      const currentEnd: [number, number] = [
        A[0] + (B[0] - A[0]) * progressC,
        A[1] + (B[1] - A[1]) * progressC,
      ];
      rc.line(A[0], A[1], currentEnd[0], currentEnd[1], {
        stroke: "#f59e0b",
        strokeWidth: 4,
        roughness: 1.0,
        seed: 103, // Fixed seed
      });
    }

    // Fill & Right angle mark after triangle complete
    if (progressC >= 1) {
      // Area Fill
      rc.polygon([C, B, A], {
        stroke: "transparent",
        fill: "rgba(56, 189, 248, 0.12)",
        fillStyle: "hachure",
        fillWeight: 1.5,
        hachureAngle: 60,
        roughness: 0.8,
        seed: 104, // Fixed seed
      });

      // Right angle marker square
      rc.rectangle(C[0], C[1] - 24, 24, 24, {
        stroke: "#f43f5e",
        strokeWidth: 2,
        roughness: 0.8,
        seed: 105, // Fixed seed
      });
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
  boxSizing: "border-box"
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
            position: "relative",
            background: "rgba(30, 41, 59, 0.8)",
            padding: "24px 36px",
            borderRadius: "24px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={380} height={280} />

            {/* Edge Label a (bottom) */}
            <div
              style={{
                position: "absolute",
                left: "180px",
                bottom: "10px",
                color: "#38bdf8",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              <InlineMath math="a" />
            </div>

            {/* Edge Label b (left vertical) */}
            <div
              style={{
                position: "absolute",
                left: "45px",
                top: "140px",
                color: "#818cf8",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              <InlineMath math="b" />
            </div>

            {/* Edge Label c (hypotenuse) */}
            <div
              style={{
                position: "absolute",
                left: "205px",
                top: "125px",
                color: "#f59e0b",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              <InlineMath math="c" />
            </div>

            {/* Vertex C (Right angle vertex) */}
            <div
              style={{
                position: "absolute",
                left: "55px",
                bottom: "15px",
                color: "#94a3b8",
                fontSize: "18px",
              }}
            >
              C
            </div>

            {/* Vertex B */}
            <div
              style={{
                position: "absolute",
                left: "310px",
                bottom: "15px",
                color: "#94a3b8",
                fontSize: "18px",
              }}
            >
              B
            </div>

            {/* Vertex A */}
            <div
              style={{
                position: "absolute",
                left: "55px",
                top: "40px",
                color: "#94a3b8",
                fontSize: "18px",
              }}
            >
              A
            </div>
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "18px",
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
