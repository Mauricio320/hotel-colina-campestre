import { Element, useEditor } from "@craftjs/core";
import React from "react";

import { Button, CanvasElement, Container, Text } from "./components";

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
          label="Texto"
          refCallback={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <Text
                  text="Texto editable. Haz clic para editar."
                  fontSize="16"
                  color={{ r: "46", g: "47", b: "47", a: "1" }}
                />
              );
          }}
        />

        <ToolboxItem
          icon="🔘"
          label="Botón"
          refCallback={(ref) => {
            if (ref) connectors.create(ref, <Button text="Click me" />);
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
          icon="📦"
          label="Canvas"
          refCallback={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <CanvasElement
                  padding={["20", "20", "20", "20"]}
                  margin={["0", "0", "0", "0"]}
                  flexDirection="column"
                  width="100%"
                  height="auto"
                />
              );
          }}
        />

        <ToolboxItem
          icon={
            <div style={{ display: "flex", gap: "3px", width: "24px", height: "20px" }}>
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
              <div style={{ flex: 1, background: "#6b7280", borderRadius: "2px" }} />
            </div>
          }
          label="2 Columnas"
          refCallback={(ref) => {
            if (ref)
              connectors.create(
                ref,
                <CanvasElement
                  flexDirection="row"
                  width="100%"
                  height="auto"
                  padding={["0", "0", "0", "0"]}
                  margin={["0", "0", "20", "0"]}
                  custom={{ displayName: "2 Columnas" }}
                >
                  <CanvasElement
                    width="50%"
                    padding={["10", "10", "10", "10"]}
                    custom={{ displayName: "Columna Izq" }}
                  />
                  <CanvasElement
                    width="50%"
                    padding={["10", "10", "10", "10"]}
                    custom={{ displayName: "Columna Der" }}
                  />
                </CanvasElement>
              );
          }}
        />
      </div>
    </div>
  );
};
