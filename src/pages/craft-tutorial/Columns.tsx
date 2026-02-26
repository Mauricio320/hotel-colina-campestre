import React, { useState } from "react";
import { useNode, useEditor, Element } from "@craftjs/core";
import { Container } from "./Container";

interface ColumnsProps {
  count?: number;
  gap?: number;
  padding?: number;
  minHeight?: string;
}

export const Columns = (props: ColumnsProps) => {
  const { count = 2, gap = 16, padding = 0, minHeight = "200px" } = props;

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [isHovered, setIsHovered] = useState(false);

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: `${gap}px`,
    padding: `${padding}px`,
    minHeight,
    width: "100%",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    position: "relative",
    boxSizing: "border-box",
    border:
      enabled && (isHovered || selected)
        ? "2px dashed #3b82f6"
        : "2px solid transparent",
  };

  const columnaStyle: React.CSSProperties = {
    flex: 1,
    minHeight: "150px",
    background: "#f3f4f6",
    borderRadius: "8px",
    position: "relative",
  };

  // Generar las columnas dinámicamente
  const renderColumnas = () => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} style={columnaStyle}>
        <Element
          id={`col-${index}`}
          is={Container}
          canvas
          flexDirection="column"
          padding={16}
          background="#f3f4f6"
          minHeight="150px"
          style={{ height: "100%" }}
        />
      </div>
    ));
  };

  return (
    <div
      ref={(ref) => {
        if (enabled && ref) {
          connect(drag(ref));
        }
      }}
      style={style}
      onMouseEnter={() => enabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderColumnas()}
    </div>
  );
};

const ColumnsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ColumnsProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Count */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Número de columnas: {props.count || 2}
        </label>
        <input
          type="range"
          min={2}
          max={4}
          value={props.count || 2}
          onChange={(e) =>
            setProp((p: ColumnsProps) => (p.count = parseInt(e.target.value)))
          }
          style={{ width: "100%" }}
        />
      </div>

      {/* Gap */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Espacio entre columnas: {props.gap || 16}px
        </label>
        <input
          type="range"
          min={0}
          max={48}
          value={props.gap || 16}
          onChange={(e) =>
            setProp((p: ColumnsProps) => (p.gap = parseInt(e.target.value)))
          }
          style={{ width: "100%" }}
        />
      </div>

      {/* Padding */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Padding exterior: {props.padding || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={48}
          value={props.padding || 0}
          onChange={(e) =>
            setProp(
              (p: ColumnsProps) => (p.padding = parseInt(e.target.value))
            )
          }
          style={{ width: "100%" }}
        />
      </div>

      {/* Min Height */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Altura mínima
        </label>
        <input
          type="text"
          value={props.minHeight || ""}
          onChange={(e) =>
            setProp(
              (p: ColumnsProps) =>
                (p.minHeight = e.target.value || undefined)
            )
          }
          placeholder="200px, 300px, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>
    </div>
  );
};

Columns.craft = {
  displayName: "Columnas",
  props: {
    count: 2,
    gap: 16,
    padding: 0,
    minHeight: "200px",
  },
  rules: {
    canDrag: true,
    canDropIn: true,
    canMoveIn: true,
  },
  related: {
    settings: ColumnsSettings,
  },
};
