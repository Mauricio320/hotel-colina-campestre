import { useNode } from "@craftjs/core";
import React from "react";
import { VideoProps } from "@/types";

const defaultProps: VideoProps = {
  url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  type: "youtube",
  autoplay: false,
  controls: true,
  width: "100%",
  height: "400px",
};

const VideoSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as VideoProps }));

  const getEmbedUrl = (url: string, type: string, autoplay: boolean) => {
    let embedUrl = url;
    if (type === "youtube") {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)?.[1];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`;
      }
    } else if (type === "vimeo") {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}${autoplay ? "?autoplay=1" : ""}`;
      }
    }
    return embedUrl;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Tipo de video</label>
        <select
          value={props.type}
          onChange={(e) =>
            setProp((p: VideoProps) => ({
              ...p,
              type: e.target.value as VideoProps["type"],
              url: getEmbedUrl(p.url, e.target.value, p.autoplay || false),
            }))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="direct">URL Directa</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">URL del video</label>
        <input
          type="text"
          value={props.url}
          onChange={(e) =>
            setProp((p: VideoProps) => ({
              ...p,
              url: getEmbedUrl(e.target.value, p.type, p.autoplay || false),
            }))
          }
          placeholder={
            props.type === "youtube"
              ? "https://youtube.com/watch?v=..."
              : props.type === "vimeo"
                ? "https://vimeo.com/..."
                : "https://ejemplo.com/video.mp4"
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Ancho</label>
        <input
          type="text"
          value={props.width}
          onChange={(e) => setProp((p: VideoProps) => ({ ...p, width: e.target.value }))}
          placeholder="100%, 600px, etc."
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Alto</label>
        <input
          type="text"
          value={props.height}
          onChange={(e) => setProp((p: VideoProps) => ({ ...p, height: e.target.value }))}
          placeholder="400px, auto, etc."
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.autoplay}
            onChange={(e) => setProp((p: VideoProps) => ({ ...p, autoplay: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Autoplay</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.controls}
            onChange={(e) => setProp((p: VideoProps) => ({ ...p, controls: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Controles</span>
        </label>
      </div>
    </div>
  );
};

export const Video = (props: VideoProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  const getEmbedUrl = () => {
    if (mergedProps.type === "direct") {
      return mergedProps.url;
    }
    return mergedProps.url;
  };

  return (
    <div ref={(ref) => { connect(drag(ref)); }} style={{ width: mergedProps.width }}>
      {mergedProps.type === "direct" ? (
        <video
          src={getEmbedUrl()}
          autoPlay={mergedProps.autoplay}
          controls={mergedProps.controls}
          style={{
            width: "100%",
            height: mergedProps.height,
            borderRadius: "8px",
          }}
        />
      ) : (
        <iframe
          src={getEmbedUrl()}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: mergedProps.height,
            border: "none",
            borderRadius: "8px",
          }}
        />
      )}
    </div>
  );
};

Video.craft = {
  displayName: "Video",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: VideoSettings,
  },
};
