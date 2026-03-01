import { Element } from "@craftjs/core";
import React from "react";

import { Container } from "../Container/Container";
import { Resizer } from "../Resizer";
import { TwoColumnsSettings } from "./TwoColumnsSettings";

export type TwoColumnsProps = {
  gap: number;
  padding: number;
  margin: [string, string, string, string];
  leftWidth: string;
  rightWidth: string;
  leftBackground: Record<"r" | "g" | "b" | "a", number>;
  rightBackground: Record<"r" | "g" | "b" | "a", number>;
  width: string;
  height: string;
  children?: React.ReactNode;
};

const defaultProps: Omit<TwoColumnsProps, "children"> = {
  gap: 20,
  padding: 20,
  margin: ["0", "0", "20", "0"],
  leftWidth: "46%",
  rightWidth: "46%",
  leftBackground: { r: 240, g: 240, b: 240, a: 1 },
  rightBackground: { r: 240, g: 240, b: 240, a: 1 },
  width: "100%",
  height: "300px",
};

export const TwoColumns = (props: Partial<TwoColumnsProps>) => {
  const { gap, padding, margin, leftWidth, rightWidth, leftBackground, rightBackground } = {
    ...defaultProps,
    ...props,
  };

  return (
    <Resizer
      propKey={{ width: "width", height: "height" }}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: `${gap}px`,
        padding: `${padding}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        alignItems: "stretch",
        position: "relative",
        minHeight: "100px",
      }}
    >
      {/* Columna Izquierda */}
      <Element
        canvas
        id="two-col-left-container"
        is={Container}
        background={leftBackground}
        width={leftWidth}
        height="90%"
        padding={["20", "20", "20", "20"]}
        flexDirection="column"
        position="absolute"
        x="2%"
        y="5%"
        // bounds="parent"
        custom={{ displayName: "Left Column" }}
      />

      {/* Columna Derecha */}
      <Element
        canvas
        id="two-col-right-container"
        is={Container}
        background={rightBackground}
        width={rightWidth}
        height="90%"
        padding={["20", "20", "20", "20"]}
        flexDirection="column"
        position="absolute"
        x="52%"
        y="5%"
        // bounds="parent"
        custom={{ displayName: "Right Column" }}
      />
    </Resizer>
  );
};

TwoColumns.craft = {
  displayName: "2 Columns",
  props: defaultProps,
  related: {
    toolbar: TwoColumnsSettings,
  },
};
