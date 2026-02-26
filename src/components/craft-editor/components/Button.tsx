import { useNode } from "@craftjs/core";
import React from "react";
import { ButtonProps } from "@/types";

const defaultProps: ButtonProps = {
  text: "Click aquí",
  url: "#",
  variant: "primary",
  size: "medium",
  fullWidth: false,
  onClickAction: "link",
};

const ButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ButtonProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Texto del botón</label>
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((p: ButtonProps) => (p.text = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">URL / Enlace</label>
        <input
          type="text"
          value={props.url}
          onChange={(e) => setProp((p: ButtonProps) => (p.url = e.target.value))}
          placeholder="#section o https://ejemplo.com"
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Variante</label>
        <select
          value={props.variant}
          onChange={(e) => setProp((p: ButtonProps) => (p.variant = e.target.value as ButtonProps["variant"]))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="primary">Primario (Ámbar)</option>
          <option value="secondary">Secundario (Gris)</option>
          <option value="outline">Contorno</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Tamaño</label>
        <select
          value={props.size}
          onChange={(e) => setProp((p: ButtonProps) => (p.size = e.target.value as ButtonProps["size"]))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="small">Pequeño</option>
          <option value="medium">Mediano</option>
          <option value="large">Grande</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.fullWidth}
            onChange={(e) => setProp((p: ButtonProps) => (p.fullWidth = e.target.checked))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Ancho completo</span>
        </label>
      </div>
    </div>
  );
};

export const Button = (props: ButtonProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  const getSizeStyles = () => {
    switch (mergedProps.size) {
      case "small":
        return { padding: "8px 16px", fontSize: "14px" };
      case "large":
        return { padding: "16px 48px", fontSize: "18px" };
      default:
        return { padding: "12px 32px", fontSize: "16px" };
    }
  };

  const getVariantStyles = () => {
    switch (mergedProps.variant) {
      case "secondary":
        return {
          backgroundColor: "#6b7280",
          color: "#ffffff",
          border: "2px solid #6b7280",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "#f59e0b",
          border: "2px solid #f59e0b",
        };
      default:
        return {
          backgroundColor: "#f59e0b",
          color: "#ffffff",
          border: "2px solid #f59e0b",
        };
    }
  };

  return (
    <a
      ref={(ref) => { connect(drag(ref)); }}
      href={mergedProps.url}
      style={{
        display: mergedProps.fullWidth ? "block" : "inline-block",
        width: mergedProps.fullWidth ? "100%" : "auto",
        textAlign: "center",
        borderRadius: "8px",
        fontWeight: "bold",
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.2s",
        ...getSizeStyles(),
        ...getVariantStyles(),
      }}
    >
      {mergedProps.text}
    </a>
  );
};

Button.craft = {
  displayName: "Botón",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: ButtonSettings,
  },
};
