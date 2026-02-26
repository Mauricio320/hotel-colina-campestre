import React from "react";
import { useNode, useEditor } from "@craftjs/core";

interface VideoProps {
  url?: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  autoplay?: boolean;
}

export const Video = ({
  url = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  width,
  height,
  borderRadius,
  autoplay = false,
}: VideoProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Verificar si el editor está habilitado
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Convert YouTube watch URL to embed URL
  const getEmbedUrl = (inputUrl: string) => {
    if (inputUrl.includes("watch?v=")) {
      return inputUrl.replace("watch?v=", "embed/").split("&")[0];
    }
    if (inputUrl.includes("youtu.be/")) {
      const videoId = inputUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return inputUrl;
  };

  const embedUrl = getEmbedUrl(url);
  const finalUrl = autoplay ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1` : embedUrl;

  const isSelected = !!selected;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    ...(width && { width }),
  };

  const iframeStyle: React.CSSProperties = {
    width: "100%",
    height: height || "315px",
    border: "none",
    ...(borderRadius !== undefined && { borderRadius: `${borderRadius}px` }),
    pointerEvents: isSelected ? "auto" : "none",
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
      <iframe
        src={finalUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={iframeStyle}
      />
      {/* Overlay solo visible en modo edición y cuando no está seleccionado */}
      {enabled && !isSelected && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: "pointer",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};

const VideoSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as VideoProps }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* URL */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "#374151" }}>
          URL del video (YouTube)
        </label>
        <input
          type="text"
          value={props.url}
          onChange={(e) => setProp((p: VideoProps) => (p.url = e.target.value))}
          placeholder="https://www.youtube.com/watch?v=..."
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
          onChange={(e) => setProp((p: VideoProps) => (p.width = e.target.value || undefined))}
          placeholder="100%, 560px, etc."
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
          onChange={(e) => setProp((p: VideoProps) => (p.height = e.target.value || undefined))}
          placeholder="315px, 400px, etc."
          style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
        />
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
          onChange={(e) => setProp((p: VideoProps) => (p.borderRadius = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Autoplay */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={props.autoplay || false}
            onChange={(e) => setProp((p: VideoProps) => (p.autoplay = e.target.checked))}
            style={{ width: "16px", height: "16px" }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>Reproducción automática</span>
        </label>
      </div>
    </div>
  );
};

Video.craft = {
  displayName: "Video",
  props: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  related: {
    settings: VideoSettings,
  },
};
