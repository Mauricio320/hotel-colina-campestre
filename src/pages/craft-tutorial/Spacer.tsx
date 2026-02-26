import React from "react";
import { useNode, useEditor } from "@craftjs/core";

interface SpacerProps {
  height?: number;
  backgroundColor?: string;
  showLine?: boolean;
}

export const Spacer = ({ height = 32, backgroundColor, showLine = false }: SpacerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Verificar si el editor está habilitado
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const style: React.CSSProperties = {
    height: `${height}px`,
    backgroundColor: backgroundColor || "transparent",
    borderBottom: showLine ? "1px dashed #d1d5db" : "none",
    backgroundImage: !backgroundColor && !showLine
      ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(209, 213, 219, 0.3) 5px, rgba(209, 213, 219, 0.3) 10px)"
      : undefined,
  };

  return (
    <div
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      style={style}
    />
  );
};

const SpacerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SpacerProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Height */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Altura: {props.height || 32}px
        </label>
        <input
          type="range"
          min={8}
          max={200}
          value={props.height || 32}
          onChange={(e) => setProp((p: SpacerProps) => (p.height = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
        <input
          type="number"
          value={props.height || 32}
          onChange={(e) => setProp((p: SpacerProps) => (p.height = parseInt(e.target.value) || 0))}
          style={{ width: "100%", marginTop: "8px", padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Background Color */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Color de fondo
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.backgroundColor || "#ffffff"}
            onChange={(e) => setProp((p: SpacerProps) => (p.backgroundColor = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.backgroundColor || ""}
            onChange={(e) => setProp((p: SpacerProps) => (p.backgroundColor = e.target.value || undefined))}
            placeholder="transparent, #fff, etc."
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Show Line */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={props.showLine || false}
            onChange={(e) => setProp((p: SpacerProps) => (p.showLine = e.target.checked))}
            style={{ width: "16px", height: "16px" }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Mostrar línea guía</span>
        </label>
      </div>
    </div>
  );
};

Spacer.craft = {
  displayName: "Espaciador",
  props: {
    height: 32,
  },
  related: {
    settings: SpacerSettings,
  },
};
