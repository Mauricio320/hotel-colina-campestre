import { useNode } from "@craftjs/core";
import React, { useState } from "react";
import { GalleryProps } from "@/types";

const defaultProps: GalleryProps = {
  columns: 3,
  gap: 16,
  images: [
    {
      src: "https://placehold.co/400x300/e2e8f0/475569?text=Imagen+1",
      alt: "Imagen 1",
      caption: "Descripción de la imagen 1",
    },
    {
      src: "https://placehold.co/400x300/e2e8f0/475569?text=Imagen+2",
      alt: "Imagen 2",
      caption: "Descripción de la imagen 2",
    },
    {
      src: "https://placehold.co/400x300/e2e8f0/475569?text=Imagen+3",
      alt: "Imagen 3",
      caption: "Descripción de la imagen 3",
    },
  ],
};

const GallerySettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as GalleryProps }));

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setProp((p: GalleryProps) => ({
      ...p,
      images: [
        ...p.images,
        {
          src: newImageUrl,
          alt: newImageAlt || `Imagen ${p.images.length + 1}`,
          caption: "",
        },
      ],
    }));
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const removeImage = (index: number) => {
    setProp((p: GalleryProps) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index: number, field: keyof GalleryProps["images"][0], value: string) => {
    setProp((p: GalleryProps) => ({
      ...p,
      images: p.images.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Columnas</label>
        <select
          value={props.columns}
          onChange={(e) =>
            setProp((p: GalleryProps) => ({ ...p, columns: parseInt(e.target.value) as GalleryProps["columns"] }))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value={2}>2 columnas</option>
          <option value={3}>3 columnas</option>
          <option value={4}>4 columnas</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Espacio entre imágenes (px)</label>
        <input
          type="range"
          min="4"
          max="48"
          value={props.gap}
          onChange={(e) => setProp((p: GalleryProps) => ({ ...p, gap: parseInt(e.target.value) }))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.gap}px</span>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Agregar imagen</label>
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="URL de la imagen"
            className="w-full rounded border p-2 text-sm"
          />
          <input
            type="text"
            value={newImageAlt}
            onChange={(e) => setNewImageAlt(e.target.value)}
            placeholder="Texto alternativo"
            className="w-full rounded border p-2 text-sm"
          />
          <button
            onClick={addImage}
            disabled={!newImageUrl.trim()}
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            + Agregar imagen
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Imágenes ({props.images.length})</label>
        <div className="mt-2 flex flex-col gap-2">
          {props.images.map((image, index) => (
            <div key={index} className="rounded border border-gray-200 p-2">
              <div className="flex items-center gap-2">
                <img src={image.src} alt={image.alt} className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={image.src}
                    onChange={(e) => updateImage(index, "src", e.target.value)}
                    className="w-full rounded border p-1 text-xs"
                    placeholder="URL"
                  />
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(index, "alt", e.target.value)}
                    className="mt-1 w-full rounded border p-1 text-xs"
                    placeholder="Alt text"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <i className="pi pi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Gallery = (props: GalleryProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  return (
    <div
      ref={(ref) => { connect(drag(ref)); }}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${mergedProps.columns}, 1fr)`,
        gap: `${mergedProps.gap}px`,
        width: "100%",
      }}
    >
      {mergedProps.images.map((image, index) => (
        <div key={index} style={{ position: "relative", overflow: "hidden", borderRadius: "8px" }}>
          <img
            src={image.src}
            alt={image.alt}
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              display: "block",
            }}
          />
          {image.caption && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "12px",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "#ffffff",
                fontSize: "0.875rem",
              }}
            >
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

Gallery.craft = {
  displayName: "Galería",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: GallerySettings,
  },
};
