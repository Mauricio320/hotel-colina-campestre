import { useNode } from "@craftjs/core";
import React from "react";
import { ImageProps } from "@/types";

const defaultProps: ImageProps = {
  src: "https://placehold.co/600x400/e2e8f0/475569?text=Imagen",
  alt: "Imagen descriptiva",
  width: "100%",
  height: "auto",
  objectFit: "cover",
  borderRadius: 0,
};

const ImageSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ImageProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">URL de la imagen</label>
        <input
          type="text"
          value={props.src}
          onChange={(e) => setProp((p: ImageProps) => (p.src = e.target.value))}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Texto alternativo (alt)</label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => setProp((p: ImageProps) => (p.alt = e.target.value))}
          placeholder="Descripción de la imagen"
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Ancho</label>
        <input
          type="text"
          value={props.width}
          onChange={(e) => setProp((p: ImageProps) => (p.width = e.target.value))}
          placeholder="100%, 300px, etc."
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Alto</label>
        <input
          type="text"
          value={props.height}
          onChange={(e) => setProp((p: ImageProps) => (p.height = e.target.value))}
          placeholder="auto, 200px, etc."
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Ajuste de imagen</label>
        <select
          value={props.objectFit}
          onChange={(e) =>
            setProp((p: ImageProps) => (p.objectFit = e.target.value as ImageProps["objectFit"]))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="cover">Cover (cubrir)</option>
          <option value="contain">Contain (contener)</option>
          <option value="fill">Fill (llenar)</option>
          <option value="none">None (ninguno)</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Radio de borde (px)</label>
        <input
          type="range"
          min="0"
          max="50"
          value={props.borderRadius}
          onChange={(e) => setProp((p: ImageProps) => (p.borderRadius = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.borderRadius}px</span>
      </div>
    </div>
  );
};

export const Image = (props: ImageProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  return (
    <img
      ref={(ref) => {
        connect(drag(ref));
      }}
      src={mergedProps.src}
      alt={mergedProps.alt}
      style={{
        width: mergedProps.width,
        height: mergedProps.height,
        objectFit: mergedProps.objectFit,
        borderRadius: `${mergedProps.borderRadius}px`,
        display: "block",
      }}
    />
  );
};

Image.craft = {
  displayName: "Imagen",

  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: ImageSettings,
  },
};
