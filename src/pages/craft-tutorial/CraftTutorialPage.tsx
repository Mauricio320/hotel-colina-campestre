import { Editor, Element, Frame, useEditor } from "@craftjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useLandingPageState, useSaveLandingPage } from "@/hooks/useLandingPage";
import { Button, CanvasElement, Container, Text } from "./components";
import { SettingsPanel } from "./SettingsPanel";
import { Toolbox } from "./Toolbox";

/**
 * Limpia el HTML de atributos y elementos de Craft.js
 */
const cleanHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const container = doc.body.firstElementChild;

  if (!container) return html;

  // Eliminar atributos de Craft.js de todos los elementos
  const allElements = container.querySelectorAll("*");
  allElements.forEach((el) => {
    // Eliminar atributo draggable
    el.removeAttribute("draggable");

    // Eliminar data-craft-* attributes
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-craft")) {
        el.removeAttribute(attr.name);
      }
    });

    // Eliminar estilos de pointer-events si existen (usados en edición)
    const style = el.getAttribute("style") || "";
    if (style.includes("pointer-events")) {
      const newStyle = style.replace(/pointer-events:\s*[^;]+;?/g, "");
      if (newStyle.trim()) {
        el.setAttribute("style", newStyle);
      }
    }
  });

  return container.outerHTML;
};

interface EditorHeaderProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

// Componente interno para acceder al contexto del editor
const EditorHeader = ({ canvasRef }: EditorHeaderProps) => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));
  const { employee } = useAuth();
  const saveMutation = useSaveLandingPage();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!employee?.id) {
      alert("Debes iniciar sesión para guardar");
      return;
    }

    setIsSaving(true);
    try {
      const nodesJson = query.serialize() as unknown as Record<string, unknown>;

      let htmlContent = "";
      if (canvasRef.current) {
        const rawHtml = canvasRef.current.innerHTML;
        htmlContent = cleanHtml(rawHtml);
      }

      await saveMutation.mutateAsync({
        nodesJson,
        htmlContent,
        globalStyles: {},
        employeeId: employee.id,
      });
      actions.history.clear();
      alert("Landing page guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la landing page");
    } finally {
      setIsSaving(false);
    }
  }, [actions, query, saveMutation, employee, canvasRef]);

  return (
    <div
      style={{
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          Editor de Landing Page
        </h2>
        <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
          Arrastra elementos desde la izquierda y configúralos desde la derecha
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Undo/Redo */}
        <button
          onClick={() => actions.history.undo()}
          disabled={!canUndo}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#fff",
            cursor: canUndo ? "pointer" : "not-allowed",
            opacity: canUndo ? 1 : 0.5,
            fontSize: "14px",
          }}
          title="Deshacer"
        >
          ↩️
        </button>
        <button
          onClick={() => actions.history.redo()}
          disabled={!canRedo}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            background: "#fff",
            cursor: canRedo ? "pointer" : "not-allowed",
            opacity: canRedo ? 1 : 0.5,
            fontSize: "14px",
          }}
          title="Rehacer"
        >
          ↪️
        </button>

        <div style={{ width: "1px", height: "24px", background: "#e5e7eb", margin: "0 8px" }} />

        {/* Preview Button */}
        <button
          onClick={() => window.open("/craft-tutorial/preview", "_blank")}
          style={{
            padding: "8px 16px",
            background: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          👁️ Vista previa
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "8px 16px",
            background: isSaving ? "#9ca3af" : "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: isSaving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isSaving ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
                ⏳
              </span>
              Guardando...
            </>
          ) : (
            <>💾 Guardar</>
          )}
        </button>
      </div>
    </div>
  );
};

// Componente para cargar el estado guardado
interface FrameLoaderProps {
  savedState: Record<string, unknown> | undefined;
}

const FrameLoader = ({ savedState }: FrameLoaderProps) => {
  const { actions } = useEditor();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (savedState && !isLoaded) {
      try {
        // Deserialize the saved state into the editor
        actions.deserialize(savedState as Parameters<typeof actions.deserialize>[0]);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, [savedState, actions, isLoaded]);

  return null;
};

const CraftTutorialPage = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { data: savedState, isLoading } = useLandingPageState();

  if (isLoading) {
    return (
      <div
        style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div>Cargando editor...</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Editor resolver={{ Container, Text, Button, CanvasElement }}>
        <EditorHeader canvasRef={canvasRef} />
        <FrameLoader savedState={savedState?.nodes_json as Record<string, unknown> | undefined} />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Toolbox - Left */}
          <div
            style={{
              width: "220px",
              background: "#f9fafb",
              borderRight: "1px solid #e5e7eb",
              overflow: "auto",
            }}
          >
            <Toolbox />
          </div>

          {/* Canvas Area - Center */}
          <div style={{ flex: 1, padding: "24px", background: "#f3f4f6", overflow: "auto" }}>
            <div ref={canvasRef}>
              <Frame>
                <Element
                  canvas
                  is={Container}
                  width="100%"
                  maxWidth="800px"
                  height="auto"
                  background={{ r: 255, g: 255, b: 255, a: 1 }}
                  padding={["40", "40", "40", "40"]}
                  margin={["0", "auto", "0", "auto"]}
                  custom={{ displayName: "App" }}
                >
                  <Element
                    canvas
                    is={Container}
                    flexDirection="row"
                    width="100%"
                    height="auto"
                    padding={["0", "0", "0", "0"]}
                    margin={["0", "0", "20", "0"]}
                    custom={{ displayName: "Introduction" }}
                  >
                    <Element
                      canvas
                      is={Container}
                      width="50%"
                      padding={["0", "10", "0", "0"]}
                      custom={{ displayName: "Heading" }}
                    >
                      <Text
                        fontSize="23"
                        fontWeight="500"
                        text="Bienvenido al Editor de Landing Pages"
                      />
                    </Element>
                    <Element
                      canvas
                      is={Container}
                      width="50%"
                      padding={["0", "0", "0", "10"]}
                      custom={{ displayName: "Description" }}
                    >
                      <Text
                        fontSize="14"
                        fontWeight="400"
                        text="Arrastra elementos desde la barra lateral izquierda para construir tu página. Selecciona cualquier elemento para editar sus propiedades."
                      />
                    </Element>
                  </Element>
                </Element>
              </Frame>
            </div>
          </div>

          {/* Settings Panel - Right */}
          <SettingsPanel />
        </div>
      </Editor>
    </div>
  );
};

export default CraftTutorialPage;
