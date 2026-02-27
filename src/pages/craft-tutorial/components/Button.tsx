import { useNode } from "@craftjs/core";
import React from "react";

export type ButtonProps = {
  text?: string;
  background?: { r: number; g: number; b: number; a: number };
  color?: { r: number; g: number; b: number; a: number };
  fontSize?: string;
  padding?: [string, string, string, string];
  margin?: [string, string, string, string];
  borderRadius?: number;
  width?: string;
};

const defaultProps: Required<ButtonProps> = {
  text: "Botón",
  background: { r: 59, g: 130, b: 246, a: 1 },
  color: { r: 255, g: 255, b: 255, a: 1 },
  fontSize: "15",
  padding: ["10", "20", "10", "20"],
  margin: ["0", "0", "0", "0"],
  borderRadius: 6,
  width: "auto",
};

export const Button = (props: Partial<ButtonProps>) => {
  const mergedProps = { ...defaultProps, ...props };
  const { text, background, color, fontSize, padding, margin, borderRadius, width } = mergedProps;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <button
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        fontSize: `${fontSize}px`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        borderRadius: `${borderRadius}px`,
        width,
        border: "none",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      {text}
    </button>
  );
};

Button.craft = {
  displayName: "Button",
  props: {
    ...defaultProps,
  },
  rules: {
    canDrag: () => true,
  },
};
