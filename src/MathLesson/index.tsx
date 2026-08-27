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
import { Sparkles, Calculator, BookOpen, Volume2 } from "lucide-react";

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
    formulaCard,
    geometry,
    timeline,
    audio,
    subtitles,
    durationInFrames,
  } = lessonData;

  // 1. Header Animation
  const titleSpring = spring({
    frame: frame - timeline.headerStartFrame,
    fps,
    config: { damping: 12 },
  });
  const titleY = interpolate(titleSpring, [0, 1], [-100, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // 2. Triangle Card Animation
  const triangleSpring = spring({
    frame: frame - timeline.triangleStartFrame,
    fps,
    config: { damping: 14 },
  });
  const triangleScale = interpolate(triangleSpring, [0, 1], [0.6, 1]);
  const triangleOpacity = interpolate(triangleSpring, [0, 1], [0, 1]);

  // 3. Formula Card Animation
  const formulaSpring = spring({
    frame: frame - timeline.formulaStartFrame,
    fps,
    config: { damping: 14 },
  });
  const formulaScale = interpolate(formulaSpring, [0, 1], [0.5, 1]);
  const formulaOpacity = interpolate(formulaSpring, [0, 1], [0, 1]);

  // RoughJS Canvas Drawing (Driven 100% by geometry JSON schema)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);

    const { vertices, edges, fill, rightAngleMark } = geometry;

    // Draw Edges dynamically from JSON
    let allEdgesComplete = true;

    edges.forEach((edge) => {
      const fromPos = vertices[edge.from as keyof typeof vertices] as [
        number,
        number
      ];
      const toPos = vertices[edge.to as keyof typeof vertices] as [
        number,
        number
      ];

      const progress = Math.min(
        1,
        Math.max(0, (frame - edge.startFrame) / edge.duration)
      );

      if (progress < 1) {
        allEdgesComplete = false;
      }

      if (progress > 0) {
        const currentEnd: [number, number] = [
          fromPos[0] + (toPos[0] - fromPos[0]) * progress,
          fromPos[1] + (toPos[1] - fromPos[1]) * progress,
        ];

        rc.line(fromPos[0], fromPos[1], currentEnd[0], currentEnd[1], {
          stroke: edge.color,
          strokeWidth: edge.strokeWidth,
          roughness: 1.0,
          seed: edge.seed,
        });
      }
    });

    // Draw Area Fill & Right Angle Symbol when timeline conditions met
    if (allEdgesComplete && frame >= fill.startFrame) {
      // Polygon Fill
      const polygonPoints = [vertices.C, vertices.B, vertices.A] as [
        number,
        number
      ][];
      rc.polygon(polygonPoints, {
        stroke: "transparent",
        fill: fill.color,
        fillStyle: fill.fillStyle as any,
        fillWeight: 1.5,
        hachureAngle: 60,
        roughness: 0.8,
        seed: fill.seed,
      });

      // Right Angle Square Marker
      rc.rectangle(
        rightAngleMark.x,
        rightAngleMark.y,
        rightAngleMark.width,
        rightAngleMark.height,
        {
          stroke: rightAngleMark.color,
          strokeWidth: 2.5,
          roughness: 0.8,
          seed: rightAngleMark.seed,
        }
      );
    }
  }, [frame, geometry]);

  // Current Subtitle Cue
  const currentCue = subtitles.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );

  const isFormulaHighlighted = frame >= timeline.formulaHighlightStartFrame;

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
        padding: "50px 80px",
        boxSizing: "border-box",
      }}
    >
      {/* Dynamic TTS Voiceover Track */}
      <Audio src={staticFile(audio.full)} volume={1.0} />

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
            fontSize: "52px",
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
          margin: "20px 0",
        }}
      >
        {/* RoughJS Geometry Canvas Card */}
        <div
          style={{
            transform: `scale(${triangleScale})`,
            opacity: triangleOpacity,
            position: "relative",
            background: "rgba(30, 41, 59, 0.85)",
            padding: "20px 36px",
            borderRadius: "24px",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              width={geometry.canvasWidth}
              height={geometry.canvasHeight}
            />

            {/* Edge Math Labels (a, b, c) - Dynamically mapped from JSON */}
            {geometry.edgeLabels.map((lbl, idx) => {
              if (frame < lbl.startFrame) return null;
              return (
                <div
                  key={`edge-lbl-${idx}`}
                  style={{
                    position: "absolute",
                    left: lbl.left,
                    top: lbl.top,
                    bottom: lbl.bottom,
                    color: lbl.color,
                    fontSize: lbl.fontSize,
                    fontWeight: 700,
                  }}
                >
                  <InlineMath math={lbl.symbol} />
                </div>
              );
            })}

            {/* Vertex Labels (A, B, C) - Dynamically mapped from JSON */}
            {geometry.vertexLabels.map((lbl, idx) => {
              if (frame < lbl.startFrame) return null;
              return (
                <div
                  key={`vertex-lbl-${idx}`}
                  style={{
                    position: "absolute",
                    left: lbl.left,
                    top: lbl.top,
                    bottom: lbl.bottom,
                    color: lbl.color,
                    fontSize: "18px",
                  }}
                >
                  {lbl.name}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "18px",
              color: "#94a3b8",
            }}
          >
            {geometry.title}
          </div>
        </div>

        {/* KaTeX Formula Box */}
        <div
          style={{
            transform: `scale(${formulaScale})`,
            opacity: formulaOpacity,
            background: "rgba(30, 41, 59, 0.95)",
            padding: "40px 60px",
            borderRadius: "24px",
            border: isFormulaHighlighted
              ? "2px solid #38bdf8"
              : "2px solid #818cf8",
            boxShadow: isFormulaHighlighted
              ? "0 0 50px rgba(56, 189, 248, 0.4)"
              : "0 0 30px rgba(129, 140, 248, 0.2)",
            textAlign: "center",
            transition: "all 0.3s ease",
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
            <span>{formulaCard.badge}</span>
          </div>

          <div style={{ fontSize: "52px" }}>
            <BlockMath math={formula} />
          </div>

          <div
            style={{
              marginTop: "24px",
              fontSize: "22px",
              color: "#cbd5e1",
            }}
          >
            {formulaCard.description}
          </div>
        </div>
      </main>

      {/* Subtitles Overlay */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          minHeight: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "rgba(15, 23, 42, 0.9)",
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
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {currentCue ? currentCue.text : "..."}
        </span>
      </div>

      {/* Footer / Progress Bar */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: "18px",
          color: "#64748b",
          paddingTop: "12px",
        }}
      >
        MathLogic Edge TTS Sync Animation • Frame: {frame} / {durationInFrames}
      </footer>
    </AbsoluteFill>
  );
};
