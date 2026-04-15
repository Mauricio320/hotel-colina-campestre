import { useNode } from "@craftjs/core";
import React from "react";
import { ContainerProps } from "@/types";

const defaultProps: ContainerProps = {
  background: "#ffffff",
  padding: 20,
  margin: 0,
  width: "100%",
  maxWidth: "1200px",
  minHeight: "100px",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: 16,
};

// Settings component
const ContainerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ContainerProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Color de fondo</label>
        <input
          type="color"
          value={props.background}
          onChange={(e) => setProp((p: ContainerProps) => (p.background = e.target.value))}
          className="mt-1 h-10 w-full rounded border"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Padding (px)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={props.padding}
          onChange={(e) => setProp((p: ContainerProps) => (p.padding = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.padding}px</span>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Margin (px)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={props.margin}
          onChange={(e) => setProp((p: ContainerProps) => (p.margin = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.margin}px</span>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Ancho máximo</label>
        <select
          value={props.maxWidth}
          onChange={(e) => setProp((p: ContainerProps) => (p.maxWidth = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="none">Sin límite</option>
          <option value="768px">Pequeño (768px)</option>
          <option value="1024px">Mediano (1024px)</option>
          <option value="1200px">Grande (1200px)</option>
          <option value="1400px">Extra grande (1400px)</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Dirección Flex</label>
        <select
          value={props.flexDirection}
          onChange={(e) =>
            setProp(
              (p: ContainerProps) =>
                (p.flexDirection = e.target.value as ContainerProps["flexDirection"])
            )
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="column">Vertical</option>
          <option value="row">Horizontal</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Alineación horizontal</label>
        <select
          value={props.justifyContent}
          onChange={(e) =>
            setProp(
              (p: ContainerProps) =>
                (p.justifyContent = e.target.value as ContainerProps["justifyContent"])
            )
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="flex-start">Izquierda</option>
          <option value="center">Centro</option>
          <option value="flex-end">Derecha</option>
          <option value="space-between">Espaciado</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Espacio entre elementos (gap)</label>
        <input
          type="range"
          min="0"
          max="64"
          value={props.gap}
          onChange={(e) => setProp((p: ContainerProps) => (p.gap = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.gap}px</span>
      </div>
    </div>
  );
};

interface ContainerComponentProps extends ContainerProps {
  children?: React.ReactNode;
}

export const Container = (props: ContainerComponentProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  return (
    <div
      ref={(ref) => {
        connect(drag(ref));
      }}
      style={{
        background: mergedProps.background,
        padding: `${mergedProps.padding}px`,
        margin: `${mergedProps.margin}px auto`,
        width: mergedProps.width,
        maxWidth: mergedProps.maxWidth === "none" ? undefined : mergedProps.maxWidth,
        minHeight: mergedProps.minHeight,
        display: "flex",
        flexDirection: mergedProps.flexDirection,
        justifyContent: mergedProps.justifyContent,
        alignItems: mergedProps.alignItems,
        gap: `${mergedProps.gap}px`,
      }}
    >
      {mergedProps.children}
    </div>
  );
};

// Craft.js configuration - NO isCanvas here!
Container.craft = {
  displayName: "Contenedor",
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: ContainerSettings,
  },
};
