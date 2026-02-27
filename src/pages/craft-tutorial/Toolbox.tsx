import React from "react";
import { Element, useEditor } from "@craftjs/core";
import { Container } from "./Container";
import { Button } from "./Button";
import { Text } from "./Text";
import { Image } from "./Image";
import { Spacer } from "./Spacer";
import { Video } from "./Video";
import { Heading } from "./Heading";
import { Link } from "./Link";
import { Divider } from "./Divider";

import { SplitColumns } from "./SplitColumns";
import { Columns } from "./Columns";

interface ToolboxItemProps {
  icon: React.ReactNode;
  label: string;
  refCallback: (ref: HTMLButtonElement | null) => void;
}

const ToolboxItem = ({ icon, label, refCallback }: ToolboxItemProps) => (
  <button
    ref={refCallback}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      padding: "12px 16px",
      cursor: "grab",
      textAlign: "left",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#3b82f6";
      e.currentTarget.style.background = "#eff6ff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#e5e7eb";
      e.currentTarget.style.background = "#fff";
    }}
  >
    <span style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>{icon}</span>
    <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{label}</span>
  </button>
);

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div style={{ padding: "20px" }}>
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "14px",
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Elementos
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <ToolboxItem
          icon="📝"
          label="Título"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Heading text="Título" level={1} />);
          }}
        />

        <ToolboxItem
          icon="📄"
          label="Texto"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Text text="Texto de párrafo" />);
          }}
        />

        <ToolboxItem
          icon="🔘"
          label="Botón"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Button text="Click me" />);
          }}
        />

        <ToolboxItem
          icon="🔗"
          label="Enlace"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Link text="Enlace" url="#" />);
          }}
        />

        <ToolboxItem
          icon="🖼️"
          label="Imagen"
          refCallback={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <Image src="https://placehold.co/600x400/e2e8f0/475569?text=Imagen" />
              );
          }}
        />

        <ToolboxItem
          icon="🎥"
          label="Video"
          refCallback={(ref) => {
            if (ref)
              connectors.create(ref, <Video url="https://www.youtube.com/embed/dQw4w9WgXcQ" />);
          }}
        />

        <div style={{ height: "1px", background: "#e5e7eb", margin: "12px 0" }} />

        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Layout
        </h3>

        <ToolboxItem
          icon="🗂️"
          label="Columna"
          refCallback={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <Element is={Container} padding={20} canvas flexDirection="column" />
              );
          }}
        />

        {/* Icono 2 columnas */}
        <ToolboxItem
          icon={
            <div style={{ display: "flex", gap: "3px", width: "24px", height: "20px" }}>
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
            </div>
          }
          label="2 Columnas"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Columns columns="2" />);
          }}
        />

        {/* Icono 3 columnas */}
        <ToolboxItem
          icon={
            <div style={{ display: "flex", gap: "3px", width: "24px", height: "20px" }}>
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
            </div>
          }
          label="3 Columnas"
          refCallback={(ref) => {
            if (ref)
              connectors.create(ref, <Columns columns="3" />);
          }}
        />

        {/* Icono 4 columnas */}
        <ToolboxItem
          icon={
            <div style={{ display: "flex", gap: "2px", width: "24px", height: "20px" }}>
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
            </div>
          }
          label="4 Columnas"
          refCallback={(ref) => {
            if (ref)
              connectors.create(ref, <Columns columns="4" />);
          }}
        />

        {/* Icono 30/70 */}
        <ToolboxItem
          icon={
            <div style={{ display: "flex", gap: "3px", width: "24px", height: "20px" }}>
              <div style={{ width: "30%", background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ width: "70%", background: "#6b7280", borderRadius: "2px" }} />
            </div>
          }
          label="3/7"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <SplitColumns leftWidth="30%" rightWidth="70%" />);
          }}
        />

        <ToolboxItem
          icon="⬜"
          label="Espaciador"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Spacer height={32} />);
          }}
        />

        <ToolboxItem
          icon="➖"
          label="Separador"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Divider />);
          }}
        />
      </div>
    </div>
  );
};
