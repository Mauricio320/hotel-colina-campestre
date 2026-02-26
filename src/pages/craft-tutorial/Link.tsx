import React, { useState, useEffect } from "react";
import { useNode, useEditor } from "@craftjs/core";

interface LinkProps {
  text?: string;
  url?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "bold";
  openInNewTab?: boolean;
}

export const Link = ({
  text = "Enlace",
  url = "#",
  color,
  fontSize,
  fontWeight,
  openInNewTab = false,
}: LinkProps) => {
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
    ...(color && { color }),
    ...(fontSize && { fontSize: `${fontSize}px` }),
    ...(fontWeight && { fontWeight: fontWeightMap[fontWeight] }),
  };

  return (
    <a
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      href={enabled ? undefined : url}
      target={!enabled && openInNewTab ? "_blank" : undefined}
      rel={!enabled && openInNewTab ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (enabled) {
          e.preventDefault();
          setEditable(true);
        }
      }}
      style={style}
    >
      {editable && enabled ? (
        <input
          type="text"
          value={text}
          onChange={(e) =>
            setProp((props: LinkProps) => (props.text = e.target.value))
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
    </a>
  );
};

const LinkSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as LinkProps }));

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
          onChange={(e) => setProp((p: LinkProps) => (p.text = e.target.value))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* URL */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          URL
        </label>
        <input
          type="text"
          value={props.url}
          onChange={(e) => setProp((p: LinkProps) => (p.url = e.target.value))}
          placeholder="https://..."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
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
            value={props.color || "#3b82f6"}
            onChange={(e) => setProp((p: LinkProps) => (p.color = e.target.value))}
            style={{ width: "40px", height: "32px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}
          />
          <input
            type="text"
            value={props.color || ""}
            onChange={(e) => setProp((p: LinkProps) => (p.color = e.target.value))}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Tamaño de fuente: {props.fontSize || 16}px
        </label>
        <input
          type="range"
          min={12}
          max={48}
          value={props.fontSize || 16}
          onChange={(e) => setProp((p: LinkProps) => (p.fontSize = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
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
              onClick={() => setProp((p: LinkProps) => (p.fontWeight = weight as LinkProps["fontWeight"]))}
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

      {/* Open in New Tab */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={props.openInNewTab || false}
            onChange={(e) => setProp((p: LinkProps) => (p.openInNewTab = e.target.checked))}
            style={{ width: "16px", height: "16px" }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Abrir en nueva pestaña</span>
        </label>
      </div>
    </div>
  );
};

Link.craft = {
  displayName: "Enlace",
  props: {
    text: "Enlace",
    url: "#",
  },
  related: {
    settings: LinkSettings,
  },
};
