import React, { useState, useEffect } from "react";
import { useNode, useEditor } from "@craftjs/core";

interface HeadingProps {
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  align?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
}

export const Heading = ({
  text = "Título",
  level = 1,
  color,
  align,
  marginTop,
  marginBottom,
}: HeadingProps) => {
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

  const Tag = `h${level}`;

  const style: React.CSSProperties = {
    ...(color && { color }),
    ...(align && { textAlign: align }),
    ...(marginTop !== undefined && { marginTop: `${marginTop}px` }),
    ...(marginBottom !== undefined && { marginBottom: `${marginBottom}px` }),
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
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
            setProp((props: HeadingProps) => (props.text = e.target.value))
          }
          onBlur={() => setEditable(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditable(false);
          }}
          autoFocus
          style={{ ...style, width: "100%", fontSize: "inherit", fontWeight: "inherit" }}
        />
      ) : (
        <div style={style}>{text}</div>
      )}
    </div>
  );
};

const HeadingSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as HeadingProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Text Content */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Texto
        </label>
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((p: HeadingProps) => (p.text = e.target.value))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Level */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Nivel de título
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setProp((p: HeadingProps) => (p.level = lvl as HeadingProps["level"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.level === lvl ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.level === lvl ? "#eff6ff" : "#fff",
                color: props.level === lvl ? "#3b82f6" : "#374151",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              H{lvl}
            </button>
          ))}
        </div>
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
            onChange={(e) => setProp((p: HeadingProps) => (p.color = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.color || ""}
            onChange={(e) => setProp((p: HeadingProps) => (p.color = e.target.value))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Align */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Alineación
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["left", "center", "right"].map((a) => (
            <button
              key={a}
              onClick={() => setProp((p: HeadingProps) => (p.align = a as HeadingProps["align"]))}
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.align === a ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.align === a ? "#eff6ff" : "#fff",
                color: props.align === a ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {a === "left" ? "Izq" : a === "center" ? "Cent" : "Der"}
            </button>
          ))}
        </div>
      </div>

      {/* Margin Top */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Margen superior: {props.marginTop || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={64}
          value={props.marginTop || 0}
          onChange={(e) => setProp((p: HeadingProps) => (p.marginTop = parseInt(e.target.value)))}
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
          onChange={(e) => setProp((p: HeadingProps) => (p.marginBottom = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

Heading.craft = {
  displayName: "Título",
  props: {
    text: "Título",
    level: 1,
  },
  related: {
    settings: HeadingSettings,
  },
};
