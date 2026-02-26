import React, { useState } from "react";
import { useNode, useEditor, Element } from "@craftjs/core";
import { Container } from "./Container";

interface SplitColumnsProps {
  leftWidth?: string;
  rightWidth?: string;
  gap?: number;
  padding?: number;
  minHeight?: string;
}

export const SplitColumns = (props: SplitColumnsProps) => {
  const {
    leftWidth = "30%",
    rightWidth = "70%",
    gap = 16,
    padding = 0,
    minHeight = "200px",
  } = props;

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

  const columnaIzqStyle: React.CSSProperties = {
    width: leftWidth,
    minHeight: "150px",
    background: "#f3f4f6",
    borderRadius: "8px",
    position: "relative",
  };

  const columnaDerStyle: React.CSSProperties = {
    width: rightWidth,
    minHeight: "150px",
    background: "#f3f4f6",
    borderRadius: "8px",
    position: "relative",
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
      {/* Columna izquierda */}
      <div style={columnaIzqStyle}>
        <Element
          id="izquierda"
          is={Container}
          canvas
          flexDirection="column"
          padding={16}
          background="#f3f4f6"
          minHeight="150px"
          style={{ height: "100%" }}
        />
      </div>

      {/* Columna derecha */}
      <div style={columnaDerStyle}>
        <Element
          id="derecha"
          is={Container}
          canvas
          flexDirection="column"
          padding={16}
          background="#f3f4f6"
          minHeight="150px"
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

const SplitColumnsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SplitColumnsProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Left Width */}
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
          Ancho columna izquierda
        </label>
        <input
          type="text"
          value={props.leftWidth || "30%"}
          onChange={(e) =>
            setProp(
              (p: SplitColumnsProps) =>
                (p.leftWidth = e.target.value || undefined)
            )
          }
          placeholder="30%, 300px, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Right Width */}
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
          Ancho columna derecha
        </label>
        <input
          type="text"
          value={props.rightWidth || "70%"}
          onChange={(e) =>
            setProp(
              (p: SplitColumnsProps) =>
                (p.rightWidth = e.target.value || undefined)
            )
          }
          placeholder="70%, 700px, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
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
            setProp((p: SplitColumnsProps) => (p.gap = parseInt(e.target.value)))
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
              (p: SplitColumnsProps) => (p.padding = parseInt(e.target.value))
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
              (p: SplitColumnsProps) =>
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

SplitColumns.craft = {
  displayName: "Columnas Split",
  props: {
    leftWidth: "30%",
    rightWidth: "70%",
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
    settings: SplitColumnsSettings,
  },
};
