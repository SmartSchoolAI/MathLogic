import React from "react";
import { Composition } from "remotion";
import { MathLesson } from "./MathLesson";
import summaryData from "../public/001-pythagorean-theorem/summary.json";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MathLesson"
        component={MathLesson}
        durationInFrames={summaryData.durationInFrames}
        fps={summaryData.fps}
        width={1920}
        height={1080}
        defaultProps={{
          lessonData: summaryData,
        }}
      />
    </>
  );
};
