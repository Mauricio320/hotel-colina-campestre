import { useNode } from "@craftjs/core";
import React from "react";
import { HeroProps } from "@/types";

const defaultProps: HeroProps = {
  title: "Bienvenido a Hotel Colina Campestre",
  subtitle: "Un lugar mágico para descansar y disfrutar",
  backgroundImage: "https://placehold.co/1920x1080/059669/ffffff?text=Hero+Background",
  backgroundColor: "#059669",
  textColor: "#ffffff",
  ctaText: "Reservar Ahora",
  ctaUrl: "#reservar",
  ctaVariant: "primary",
  minHeight: "500px",
  textAlign: "center",
  overlayOpacity: 0.4,
};

const HeroSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as HeroProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={props.title}
          onChange={(e) => setProp((p: HeroProps) => (p.title = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Subtítulo</label>
        <textarea
          value={props.subtitle}
          onChange={(e) => setProp((p: HeroProps) => (p.subtitle = e.target.value))}
          rows={2}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">URL de imagen de fondo</label>
        <input
          type="text"
          value={props.backgroundImage}
          onChange={(e) => setProp((p: HeroProps) => (p.backgroundImage = e.target.value))}
          placeholder="https://ejemplo.com/fondo.jpg"
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Color de fondo (fallback)</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((p: HeroProps) => (p.backgroundColor = e.target.value))}
          className="mt-1 h-10 w-full rounded border"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Color del texto</label>
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((p: HeroProps) => (p.textColor = e.target.value))}
          className="mt-1 h-10 w-full rounded border"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Texto del botón CTA</label>
        <input
          type="text"
          value={props.ctaText}
          onChange={(e) => setProp((p: HeroProps) => (p.ctaText = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">URL del botón CTA</label>
        <input
          type="text"
          value={props.ctaUrl}
          onChange={(e) => setProp((p: HeroProps) => (p.ctaUrl = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Variante del botón</label>
        <select
          value={props.ctaVariant}
          onChange={(e) =>
            setProp((p: HeroProps) => (p.ctaVariant = e.target.value as HeroProps["ctaVariant"]))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="primary">Primario</option>
          <option value="secondary">Secundario</option>
          <option value="outline">Contorno</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Altura mínima</label>
        <select
          value={props.minHeight}
          onChange={(e) => setProp((p: HeroProps) => (p.minHeight = e.target.value))}
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="300px">Pequeña (300px)</option>
          <option value="400px">Mediana (400px)</option>
          <option value="500px">Grande (500px)</option>
          <option value="600px">Extra grande (600px)</option>
          <option value="100vh">Pantalla completa</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Alineación del texto</label>
        <select
          value={props.textAlign}
          onChange={(e) =>
            setProp((p: HeroProps) => (p.textAlign = e.target.value as HeroProps["textAlign"]))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value="left">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Opacidad del overlay</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={props.overlayOpacity}
          onChange={(e) =>
            setProp((p: HeroProps) => (p.overlayOpacity = parseFloat(e.target.value)))
          }
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.overlayOpacity}</span>
      </div>
    </div>
  );
};

export const Hero = (props: HeroProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  const getButtonStyles = () => {
    const baseStyles = {
      padding: "12px 32px",
      borderRadius: "8px",
      fontWeight: "bold",
      textDecoration: "none",
      display: "inline-block",
      marginTop: "24px",
      transition: "all 0.2s",
    };

    switch (mergedProps.ctaVariant) {
      case "secondary":
        return {
          ...baseStyles,
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
        };
      case "outline":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          color: mergedProps.textColor,
          border: `2px solid ${mergedProps.textColor}`,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: "#f59e0b",
          color: "#ffffff",
        };
    }
  };

  return (
    <div
      ref={(ref) => {
        connect(drag(ref));
      }}
      style={{
        position: "relative",
        minHeight: mergedProps.minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent:
          mergedProps.textAlign === "center"
            ? "center"
            : mergedProps.textAlign === "left"
              ? "flex-start"
              : "flex-end",
        padding: "48px",
        backgroundImage: mergedProps.backgroundImage
          ? `url(${mergedProps.backgroundImage})`
          : undefined,
        backgroundColor: mergedProps.backgroundColor,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${mergedProps.overlayOpacity})`,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: mergedProps.textAlign,
          maxWidth: "800px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: mergedProps.textColor,
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {mergedProps.title}
        </h1>
        {mergedProps.subtitle && (
          <p
            style={{
              fontSize: "1.25rem",
              color: mergedProps.textColor,
              opacity: 0.9,
            }}
          >
            {mergedProps.subtitle}
          </p>
        )}
        {mergedProps.ctaText && (
          <a href={mergedProps.ctaUrl} style={getButtonStyles()}>
            {mergedProps.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};

Hero.craft = {
  displayName: "Hero",

  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: HeroSettings,
  },
};
