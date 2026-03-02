import { Element, useNode } from "@craftjs/core";
import React from "react";

export type CanvasElementProps = {
  background?: { r: number; g: number; b: number; a: number };
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
  custom?: { displayName?: string };
  children?: React.ReactNode;
};

const defaultProps: Required<CanvasElementProps> = {
  background: { r: 255, g: 255, b: 255, a: 0 },
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  fillSpace: "no",
  width: "100%",
  height: "auto",
  padding: ["20", "20", "20", "20"],
  margin: ["0", "0", "0", "0"],
  shadow: 0,
  radius: 0,
  custom: { displayName: "Canvas" },
  children: undefined,
};

/**
 * CanvasElement - Un contenedor que acepta elementos hijos arrastrables.
 *
 * Este componente es un "Canvas Node" que puede contener otros elementos.
 * Se puede arrastrar desde el Toolbox y soltar en cualquier área canvas.
 */
export const CanvasElement = (props: Partial<CanvasElementProps>) => {
  const mergedProps = { ...defaultProps, ...props };
  const {
    background,
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
        height: height === "auto" ? "auto" : height,
        minHeight: "100px",
        backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
        padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        boxShadow:
          shadow === 0
            ? "none"
            : `0px ${shadow / 4}px ${shadow}px 0px rgba(0, 0, 0, ${Math.min(shadow / 100, 0.3)})`,
        borderRadius: `${radius}px`,
        flex: fillSpace === "yes" ? 1 : undefined,
        border: "2px dashed #cbd5e1",
        position: "relative",
      }}
    >
      {children}
      {/* Indicador visual cuando está vacío */}
      {!children && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            pointerEvents: "none",
          }}
        >
          Arrastra elementos aquí
        </div>
      )}
    </div>
  );
};

CanvasElement.craft = {
  displayName: "CanvasElement",
  props: {
    ...defaultProps,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
};
