import { useNode } from "@craftjs/core";
import React from "react";

export type ContainerProps = {
  background?: { r: number; g: number; b: number; a: number };
  color?: { r: number; g: number; b: number; a: number };
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  fillSpace?: "yes" | "no";
  width?: string;
  height?: string;
  padding?: [string, string, string, string];
  margin?: [string, string, string, string];
  shadow?: number;
  radius?: number;
  children?: React.ReactNode;
  custom?: { displayName?: string };
};

const defaultProps: Required<ContainerProps> = {
  background: { r: 255, g: 255, b: 255, a: 0 },
  color: { r: 0, g: 0, b: 0, a: 1 },
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  fillSpace: "no",
  width: "100%",
  height: "auto",
  padding: ["0", "0", "0", "0"],
  margin: ["0", "0", "0", "0"],
  shadow: 0,
  radius: 0,
  children: undefined,
  custom: { displayName: "Container" },
};

export const Container = (props: Partial<ContainerProps>) => {
  const mergedProps = { ...defaultProps, ...props };
  const {
    background,
    color,
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    width,
    height,
    padding,
    margin,
    shadow,
    radius,
    children,
  } = mergedProps;

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        display: "flex",
        flexDirection,
        alignItems,
        justifyContent,
        width,
        height,
        minHeight: children ? undefined : "48px",
        backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? "none"
            : `0px ${shadow / 4}px ${shadow}px 0px rgba(0, 0, 0, ${Math.min(shadow / 100, 0.3)})`,
        borderRadius: `${radius}px`,
        flex: fillSpace === "yes" ? 1 : undefined,
        border: "1px dashed #e5e7eb",
      }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: "Container",
  props: {
    ...defaultProps,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
};
