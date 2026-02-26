import React, { useState, useEffect } from "react";
import { useNode, useEditor } from "@craftjs/core";

interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  fontWeight?: "normal" | "medium" | "bold";
  color?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  shadow?: string;
}

export const Text = ({
  text = "Hi",
  fontSize,
  textAlign,
  fontWeight,
  color,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  shadow,
}: TextProps) => {
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

  const fontWeightMap = {
    normal: 400,
    medium: 500,
    bold: 700,
  };

  const style: React.CSSProperties = {
    ...(fontSize && { fontSize: `${fontSize}px` }),
    ...(textAlign && { textAlign }),
    ...(fontWeight && { fontWeight: fontWeightMap[fontWeight] }),
    ...(color && { color }),
    ...(marginTop !== undefined && { marginTop: `${marginTop}px` }),
    ...(marginRight !== undefined && { marginRight: `${marginRight}px` }),
    ...(marginBottom !== undefined && { marginBottom: `${marginBottom}px` }),
    ...(marginLeft !== undefined && { marginLeft: `${marginLeft}px` }),
    ...(shadow && shadow !== "none" && { textShadow: shadow }),
  };

  return (
    <div
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      onClick={() => enabled && setEditable(true)}
    >
      {editable && enabled ? (
        <input
          type="text"
          value={text}
          onChange={(e) =>
            setProp((props: TextProps) => (props.text = e.target.value))
          }
          onBlur={() => setEditable(false)}
          autoFocus
          style={{ ...style, width: "100%" }}
        />
      ) : (
        <p style={style}>{text}</p>
      )}
    </div>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TextProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Text Content */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Texto
        </label>
        <textarea
          value={props.text}
          onChange={(e) => setProp((p: TextProps) => (p.text = e.target.value))}
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            resize: "vertical",
          }}
        />
      </div>

      {/* Font Size */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Tamaño de fuente: {props.fontSize}px
        </label>
        <input
          type="range"
          min={12}
          max={72}
          value={props.fontSize || 16}
          onChange={(e) => setProp((p: TextProps) => (p.fontSize = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Color */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Color
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.color || "#000000"}
            onChange={(e) => setProp((p: TextProps) => (p.color = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.color || ""}
            onChange={(e) => setProp((p: TextProps) => (p.color = e.target.value))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Text Align */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Alineación
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["left", "center", "right", "justify"].map((align) => (
            <button
              key={align}
              onClick={() => setProp((p: TextProps) => (p.textAlign = align as TextProps["textAlign"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.textAlign === align ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.textAlign === align ? "#eff6ff" : "#fff",
                color: props.textAlign === align ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {align === "justify" ? "Justif" : align === "left" ? "Izq" : align === "center" ? "Cent" : "Der"}
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Peso
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["normal", "medium", "bold"].map((weight) => (
            <button
              key={weight}
              onClick={() => setProp((p: TextProps) => (p.fontWeight = weight as TextProps["fontWeight"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.fontWeight === weight ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.fontWeight === weight ? "#eff6ff" : "#fff",
                color: props.fontWeight === weight ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: weight === "bold" ? 700 : weight === "medium" ? 500 : 400,
              }}
            >
              {weight === "normal" ? "Regular" : weight === "medium" ? "Medio" : "Negrita"}
            </button>
          ))}
        </div>
      </div>

      {/* Margin */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Márgenes (px)
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Arriba</span>
            <input
              type="number"
              value={props.marginTop || 0}
              onChange={(e) => setProp((p: TextProps) => (p.marginTop = parseInt(e.target.value) || 0))}
              style={{ width: "100%", padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Derecha</span>
            <input
              type="number"
              value={props.marginRight || 0}
              onChange={(e) => setProp((p: TextProps) => (p.marginRight = parseInt(e.target.value) || 0))}
              style={{ width: "100%", padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Abajo</span>
            <input
              type="number"
              value={props.marginBottom || 0}
              onChange={(e) => setProp((p: TextProps) => (p.marginBottom = parseInt(e.target.value) || 0))}
              style={{ width: "100%", padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Izquierda</span>
            <input
              type="number"
              value={props.marginLeft || 0}
              onChange={(e) => setProp((p: TextProps) => (p.marginLeft = parseInt(e.target.value) || 0))}
              style={{ width: "100%", padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Sombra
        </label>
        <select
          value={props.shadow || "none"}
          onChange={(e) => setProp((p: TextProps) => (p.shadow = e.target.value))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        >
          <option value="none">Ninguna</option>
          <option value="1px 1px 2px rgba(0,0,0,0.2)">Sutil</option>
          <option value="2px 2px 4px rgba(0,0,0,0.3)">Media</option>
          <option value="4px 4px 8px rgba(0,0,0,0.4)">Fuerte</option>
        </select>
      </div>
    </div>
  );
};

Text.craft = {
  displayName: "Text",
  props: {
    text: "Hi",
  },
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: TextSettings,
  },
};
