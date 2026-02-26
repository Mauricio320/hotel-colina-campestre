import React from "react";
import { useNode, useEditor } from "@craftjs/core";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  objectFit?: "cover" | "contain" | "fill" | "none";
}

export const Image = ({
  src = "https://placehold.co/600x400/e2e8f0/475569?text=Imagen",
  alt = "Imagen",
  width,
  height,
  borderRadius,
  objectFit,
}: ImageProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Verificar si el editor está habilitado
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const style: React.CSSProperties = {
    display: "block",
    ...(width && { width }),
    ...(height && { height }),
    ...(borderRadius !== undefined && { borderRadius: `${borderRadius}px` }),
    ...(objectFit && { objectFit }),
  };

  return (
    <img
      ref={(ref) => {
        // Solo habilitar drag/connect cuando el editor está habilitado
        if (enabled) {
          connect(drag(ref));
        }
      }}
      src={src}
      alt={alt}
      style={style}
    />
  );
};

const ImageSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ImageProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Source URL */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          URL de la imagen
        </label>
        <input
          type="text"
          value={props.src}
          onChange={(e) => setProp((p: ImageProps) => (p.src = e.target.value))}
          placeholder="https://..."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Alt Text */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Texto alternativo (alt)
        </label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => setProp((p: ImageProps) => (p.alt = e.target.value))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Width */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Ancho
        </label>
        <input
          type="text"
          value={props.width || ""}
          onChange={(e) => setProp((p: ImageProps) => (p.width = e.target.value || undefined))}
          placeholder="100%, 300px, etc."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Height */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Alto
        </label>
        <input
          type="text"
          value={props.height || ""}
          onChange={(e) => setProp((p: ImageProps) => (p.height = e.target.value || undefined))}
          placeholder="auto, 200px, etc."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
      </div>

      {/* Object Fit */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Ajuste de imagen
        </label>
        <select
          value={props.objectFit || "cover"}
          onChange={(e) => setProp((p: ImageProps) => (p.objectFit = e.target.value as ImageProps["objectFit"]))}
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        >
          <option value="cover">Cover (cubrir)</option>
          <option value="contain">Contain (contener)</option>
          <option value="fill">Fill (rellenar)</option>
          <option value="none">None (ninguno)</option>
        </select>
      </div>

      {/* Border Radius */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          Radio de borde: {props.borderRadius || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 0}
          onChange={(e) => setProp((p: ImageProps) => (p.borderRadius = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

Image.craft = {
  displayName: "Imagen",
  props: {
    src: "https://placehold.co/600x400/e2e8f0/475569?text=Imagen",
    alt: "Imagen",
  },
  related: {
    settings: ImageSettings,
  },
};
