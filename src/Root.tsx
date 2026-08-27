import React from "react";
import { Composition } from "remotion";
import { MathLesson } from "./MathLesson";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MathLesson"
        component={MathLesson}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "勾股定理 (Pythagorean Theorem)",
          formula: "a^2 + b^2 = c^2",
        }}
      />
    </>
  );
};
