import React, { useState, useEffect } from "react";
import { useNode, useEditor } from "@craftjs/core";

interface ButtonProps {
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  color?: string;
  backgroundColor?: string;
  text?: string;
  borderRadius?: number;
  fullWidth?: boolean;
}

export const Button = ({
  size = "medium",
  variant = "contained",
  color,
  backgroundColor,
  text = "Botón",
  borderRadius,
  fullWidth,
}: ButtonProps) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
    actions: { setProp },
  } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
  }));

  // Verificar si el editor está habilitado
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (!hasSelectedNode) {
      setEditable(false);
    }
  }, [hasSelectedNode]);

  const style: React.CSSProperties = {
    ...(color && { color }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius !== undefined && { borderRadius: `${borderRadius}px` }),
    ...(fullWidth && { width: "100%" }),
  };

  return (
    <button
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      onClick={() => enabled && setEditable(true)}
      style={style}
    >
      {editable && enabled ? (
        <input
          type="text"
          value={text}
          onChange={(e) =>
            setProp((props: ButtonProps) => (props.text = e.target.value))
          }
          onBlur={() => setEditable(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditable(false);
          }}
          autoFocus
          style={{ width: "auto", minWidth: "60px" }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        text
      )}
    </button>
  );
};

const ButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ButtonProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Text */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Texto
        </label>
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((p: ButtonProps) => (p.text = e.target.value))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Size */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Tamaño
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["small", "medium", "large"].map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: ButtonProps) => (p.size = s as ButtonProps["size"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.size === s ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.size === s ? "#eff6ff" : "#fff",
                color: props.size === s ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s === "small" ? "Pequeño" : s === "medium" ? "Medio" : "Grande"}
            </button>
          ))}
        </div>
      </div>

      {/* Variant */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Variante
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["text", "outlined", "contained"].map((v) => (
            <button
              key={v}
              onClick={() => setProp((p: ButtonProps) => (p.variant = v as ButtonProps["variant"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.variant === v ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.variant === v ? "#eff6ff" : "#fff",
                color: props.variant === v ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {v === "text" ? "Texto" : v === "outlined" ? "Borde" : "Relleno"}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Color de fondo / borde
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.backgroundColor || "#3b82f6"}
            onChange={(e) => setProp((p: ButtonProps) => (p.backgroundColor = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.backgroundColor || ""}
            onChange={(e) => setProp((p: ButtonProps) => (p.backgroundColor = e.target.value))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Color de texto
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.color || "#ffffff"}
            onChange={(e) => setProp((p: ButtonProps) => (p.color = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.color || ""}
            onChange={(e) => setProp((p: ButtonProps) => (p.color = e.target.value))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Radio de borde: {props.borderRadius || 4}px
        </label>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 4}
          onChange={(e) => setProp((p: ButtonProps) => (p.borderRadius = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Full Width */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={props.fullWidth || false}
            onChange={(e) => setProp((p: ButtonProps) => (p.fullWidth = e.target.checked))}
            style={{ width: "16px", height: "16px" }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Ancho completo</span>
        </label>
      </div>
    </div>
  );
};

Button.craft = {
  displayName: "Button",
  props: {
    text: "Botón",
  },
  related: {
    settings: ButtonSettings,
  },
};
