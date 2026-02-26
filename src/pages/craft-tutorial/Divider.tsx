import React from "react";
import { useNode, useEditor } from "@craftjs/core";

interface DividerProps {
  color?: string;
  thickness?: number;
  marginTop?: number;
  marginBottom?: number;
  width?: string;
  style?: "solid" | "dashed" | "dotted" | "double";
}

export const Divider = ({
  color,
  thickness,
  marginTop,
  marginBottom,
  width,
  style: borderStyle,
}: DividerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Verificar si el editor está habilitado
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const wrapperStyle: React.CSSProperties = {
    marginTop: `${marginTop || 16}px`,
    marginBottom: `${marginBottom || 16}px`,
    width: width || "100%",
    display: "flex",
    justifyContent: "center",
  };

  const lineStyle: React.CSSProperties = {
    border: "none",
    borderTop: `${thickness || 1}px ${borderStyle || "solid"} ${color || "#d1d5db"}`,
    width: "100%",
    margin: 0,
  };

  return (
    <div
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      style={wrapperStyle}
    >
      <hr style={lineStyle} />
    </div>
  );
};

const DividerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as DividerProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Color */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Color
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.color || "#e5e7eb"}
            onChange={(e) => setProp((p: DividerProps) => (p.color = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.color || ""}
            onChange={(e) => setProp((p: DividerProps) => (p.color = e.target.value || undefined))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Thickness */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Grosor: {props.thickness || 1}px
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={props.thickness || 1}
          onChange={(e) => setProp((p: DividerProps) => (p.thickness = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Style */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Estilo de línea
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["solid", "dashed", "dotted", "double"].map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: DividerProps) => (p.style = s as DividerProps["style"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.style === s ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.style === s ? "#eff6ff" : "#fff",
                color: props.style === s ? "#3b82f6" : "#374151",
                fontSize: "11px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s === "solid" ? "Sólido" : s === "dashed" ? "Rayas" : s === "dotted" ? "Puntos" : "Doble"}
            </button>
          ))}
        </div>
      </div>

      {/* Width */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Ancho
        </label>
        <input
          type="text"
          value={props.width || ""}
          onChange={(e) => setProp((p: DividerProps) => (p.width = e.target.value || undefined))}
          placeholder="100%, 50%, 200px, etc."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Margin Top */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Margen superior: {props.marginTop || 16}px
        </label>
        <input
          type="range"
          min={0}
          max={64}
          value={props.marginTop || 16}
          onChange={(e) => setProp((p: DividerProps) => (p.marginTop = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Margin Bottom */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Margen inferior: {props.marginBottom || 16}px
        </label>
        <input
          type="range"
          min={0}
          max={64}
          value={props.marginBottom || 16}
          onChange={(e) => setProp((p: DividerProps) => (p.marginBottom = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

Divider.craft = {
  displayName: "Separador",
  props: {},
  related: {
    settings: DividerSettings,
  },
};
