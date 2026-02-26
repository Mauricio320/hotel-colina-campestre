import { useNode } from "@craftjs/core";
import React from "react";
import { TextProps } from "@/types";

const defaultProps: TextProps = {
  text: "Texto de ejemplo",
  tag: "p",
  fontSize: 16,
  fontWeight: "normal",
  color: "#000000",
  textAlign: "left",
  lineHeight: 1.5,
  margin: 0,
};

const TextSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TextProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Texto</label>
        <textarea
          value={props.text}
          onChange={(e) => setProp((p: TextProps) => (p.text = e.target.value))}
          rows={4}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Etiqueta</label>
        <select
          value={props.tag}
          onChange={(e) => setProp((p: TextProps) => (p.tag = e.target.value as TextProps["tag"]))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="h1">H1 - Título principal</option>
          <option value="h2">H2 - Título secundario</option>
          <option value="h3">H3 - Título terciario</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
          <option value="p">Párrafo</option>
          <option value="span">Span</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Tamaño de fuente (px)</label>
        <input
          type="range"
          min="12"
          max="72"
          value={props.fontSize}
          onChange={(e) => setProp((p: TextProps) => (p.fontSize = parseInt(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.fontSize}px</span>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Peso de fuente</label>
        <select
          value={props.fontWeight}
          onChange={(e) => setProp((p: TextProps) => (p.fontWeight = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="normal">Normal</option>
          <option value="bold">Negrita</option>
          <option value="300">Light</option>
          <option value="500">Medium</option>
          <option value="700">Bold</option>
          <option value="900">Black</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Color</label>
        <input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: TextProps) => (p.color = e.target.value))}
          className="mt-1 h-10 w-full rounded border"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Alineación</label>
        <select
          value={props.textAlign}
          onChange={(e) => setProp((p: TextProps) => (p.textAlign = e.target.value as TextProps["textAlign"]))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="left">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
          <option value="justify">Justificado</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Interlineado</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={props.lineHeight}
          onChange={(e) => setProp((p: TextProps) => (p.lineHeight = parseFloat(e.target.value)))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.lineHeight}</span>
      </div>
    </div>
  );
};

export const Text = (props: TextProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };
  const Tag = mergedProps.tag;

  return (
    <Tag
      ref={(ref) => { connect(drag(ref)); }}
      style={{
        fontSize: `${mergedProps.fontSize}px`,
        fontWeight: mergedProps.fontWeight,
        color: mergedProps.color,
        textAlign: mergedProps.textAlign,
        lineHeight: mergedProps.lineHeight,
        margin: `${mergedProps.margin}px 0`,
      }}
    >
      {mergedProps.text}
    </Tag>
  );
};

Text.craft = {
  displayName: "Texto",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: TextSettings,
  },
};
