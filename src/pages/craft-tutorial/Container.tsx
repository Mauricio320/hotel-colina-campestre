import React, { useRef, useCallback } from "react";
import { useNode, useEditor } from "@craftjs/core";

interface ContainerProps {
  background?: string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  minHeight?: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  flexDirection?: "row" | "column";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: number;
  flex?: number;
  children?: React.ReactNode;
  styleContent?: React.CSSProperties ;
  classChildren?: string;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export const Container = (props: ContainerProps) => {
  const {
    background,
    padding,
    marginTop,
    marginBottom,
    minHeight = "50px",
    width,
    height,
    borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    flexDirection = "column",
    justifyContent = "flex-start",
    alignItems = "stretch",
    gap,
    flex,
    children,
    styleContent,
  } = props;
  const {
    connectors: { connect, drag },
    actions: { setProp },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  console.log(styleContent, "prueba");

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const containerRef = useRef<HTMLDivElement>(null);

  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

  const startResize = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      resizeStartPos.current = { x: e.clientX, y: e.clientY };

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        resizeStartSize.current = {
          width: rect.width,
          height: rect.height,
        };
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - resizeStartPos.current.x;
        const dy = moveEvent.clientY - resizeStartPos.current.y;

        let newWidth = resizeStartSize.current.width;
        let newHeight = resizeStartSize.current.height;

        if (direction.includes("e")) {
          newWidth = Math.max(50, resizeStartSize.current.width + dx);
        }
        if (direction.includes("w")) {
          newWidth = Math.max(50, resizeStartSize.current.width - dx);
        }
        if (direction.includes("s")) {
          newHeight = Math.max(50, resizeStartSize.current.height + dy);
        }
        if (direction.includes("n")) {
          newHeight = Math.max(50, resizeStartSize.current.height - dy);
        }

        setProp((props: ContainerProps) => {
          props.width = `${newWidth}px`;
          props.height = `${newHeight}px`;
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [setProp]
  );

  const style: React.CSSProperties = {
    minHeight,
    display: "flex",
    flexDirection,
    justifyContent,
    alignItems,
    gap: gap !== undefined ? `${gap}px` : "0px",
    ...(width && { width }),
    ...(height && { height }),
    ...(flex !== undefined && { flex }),
    position: "relative",
    boxSizing: "border-box",
    cursor: enabled ? "move" : "default",
  };

  const handleBaseStyle: React.CSSProperties = {
    position: "absolute",
    background: "#3b82f6",
    zIndex: 100,
  };

  const cornerSize = 10;
  const edgeSize = 6;

  return (
    <div style={{ position: "relative", ...styleContent }} >
      <div
        ref={(ref) => {
          containerRef.current = ref;
          // Solo habilitar drag/connect cuando el editor está habilitado
          if (enabled) {
            connect(drag(ref));
          }
        }}
        style={style}
        className={props?.classChildren ? props?.classChildren : ""}
      >
        {children}

        {/* Resize handles overlay - only visible when selected AND editor enabled */}
        {enabled && selected && (
          <>
            {/* Corner: NW */}
            <div
              onMouseDown={(e) => startResize(e, "nw")}
              style={{
                ...handleBaseStyle,
                width: cornerSize,
                height: cornerSize,
                top: -cornerSize / 2,
                left: -cornerSize / 2,
                cursor: "nwse-resize",
                borderRadius: "50%",
              }}
            />
            {/* Corner: NE */}
            <div
              onMouseDown={(e) => startResize(e, "ne")}
              style={{
                ...handleBaseStyle,
                width: cornerSize,
                height: cornerSize,
                top: -cornerSize / 2,
                right: -cornerSize / 2,
                cursor: "nesw-resize",
                borderRadius: "50%",
              }}
            />
            {/* Corner: SW */}
            <div
              onMouseDown={(e) => startResize(e, "sw")}
              style={{
                ...handleBaseStyle,
                width: cornerSize,
                height: cornerSize,
                bottom: -cornerSize / 2,
                left: -cornerSize / 2,
                cursor: "nesw-resize",
                borderRadius: "50%",
              }}
            />
            {/* Corner: SE */}
            <div
              onMouseDown={(e) => startResize(e, "se")}
              style={{
                ...handleBaseStyle,
                width: cornerSize,
                height: cornerSize,
                bottom: -cornerSize / 2,
                right: -cornerSize / 2,
                cursor: "nwse-resize",
                borderRadius: "50%",
              }}
            />
            {/* Edge: N */}
            <div
              onMouseDown={(e) => startResize(e, "n")}
              style={{
                ...handleBaseStyle,
                width: "40px",
                height: edgeSize,
                top: -edgeSize / 2,
                left: "50%",
                transform: "translateX(-50%)",
                cursor: "ns-resize",
                borderRadius: "3px",
              }}
            />
            {/* Edge: S */}
            <div
              onMouseDown={(e) => startResize(e, "s")}
              style={{
                ...handleBaseStyle,
                width: "40px",
                height: edgeSize,
                bottom: -edgeSize / 2,
                left: "50%",
                transform: "translateX(-50%)",
                cursor: "ns-resize",
                borderRadius: "3px",
              }}
            />
            {/* Edge: W */}
            <div
              onMouseDown={(e) => startResize(e, "w")}
              style={{
                ...handleBaseStyle,
                width: edgeSize,
                height: "40px",
                left: -edgeSize / 2,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "ew-resize",
                borderRadius: "3px",
              }}
            />
            {/* Edge: E */}
            <div
              onMouseDown={(e) => startResize(e, "e")}
              style={{
                ...handleBaseStyle,
                width: edgeSize,
                height: "40px",
                right: -edgeSize / 2,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "ew-resize",
                borderRadius: "3px",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

const ContainerSettings = () => {
  const {
    id,
    actions: { setProp },
    props,
  } = useNode((node) => ({
    id: node.id,
    props: node.data.props as ContainerProps,
    hasParent: !!node.data.parent,
  }));

  // Usar el hook useEditor sin argumento para obtener actions fuera del selector
  const { actions: editorActions } = useEditor((state) => ({
    actions: (state as any).actions,
  }));

  const handleDelete = () => {
    if (!id) return;

    try {
      (editorActions as any).delete(id);
    } catch (error) {
      alert("No se puede eliminar este nodo");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Botón Eliminar */}
      <button
        onClick={handleDelete}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
          padding: "10px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        🗑 Eliminar Contenedor
      </button>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />

      {/* Background Color */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Color de fondo
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="color"
            value={props.background || "#ffffff"}
            onChange={(e) => setProp((p: ContainerProps) => (p.background = e.target.value))}
            style={{
              width: "40px",
              height: "32px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
          <input
            type="text"
            value={props.background || ""}
            onChange={(e) =>
              setProp((p: ContainerProps) => (p.background = e.target.value || undefined))
            }
            placeholder="transparent, #fff, etc."
            style={{
              flex: 1,
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Width */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Ancho
        </label>
        <input
          type="text"
          value={props.width || ""}
          onChange={(e) => setProp((p: ContainerProps) => (p.width = e.target.value || undefined))}
          placeholder="100%, 500px, auto, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Height */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Alto
        </label>
        <input
          type="text"
          value={props.height || ""}
          onChange={(e) => setProp((p: ContainerProps) => (p.height = e.target.value || undefined))}
          placeholder="300px, auto, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Padding */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Padding (interior): {props.padding || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={props.padding || 0}
          onChange={(e) => setProp((p: ContainerProps) => (p.padding = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>

      {/* Margin */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Margen superior (px)
          </label>
          <input
            type="number"
            value={props.marginTop || 0}
            onChange={(e) =>
              setProp((p: ContainerProps) => (p.marginTop = parseInt(e.target.value) || 0))
            }
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Margen inferior (px)
          </label>
          <input
            type="number"
            value={props.marginBottom || 0}
            onChange={(e) =>
              setProp((p: ContainerProps) => (p.marginBottom = parseInt(e.target.value) || 0))
            }
            style={{
              width: "100%",
              padding: "6px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Min Height */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Altura mínima
        </label>
        <input
          type="text"
          value={props.minHeight || ""}
          onChange={(e) =>
            setProp((p: ContainerProps) => (p.minHeight = e.target.value || undefined))
          }
          placeholder="100px, auto, etc."
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Border Radius */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Radio de borde: {props.borderRadius || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 0}
          onChange={(e) =>
            setProp((p: ContainerProps) => (p.borderRadius = parseInt(e.target.value)))
          }
          style={{ width: "100%" }}
        />
      </div>

      {/* Border Style */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Estilo de borde
        </label>
        <select
          value={props.borderStyle || "none"}
          onChange={(e) =>
            setProp(
              (p: ContainerProps) =>
                (p.borderStyle = e.target.value as ContainerProps["borderStyle"])
            )
          }
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="none">Ninguno</option>
          <option value="solid">Sólido</option>
          <option value="dashed">Discontinuo</option>
          <option value="dotted">Punteado</option>
        </select>
      </div>

      {props.borderStyle && props.borderStyle !== "none" && (
        <>
          {/* Border Width */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Grosor de borde: {props.borderWidth || 1}px
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={props.borderWidth || 1}
              onChange={(e) =>
                setProp((p: ContainerProps) => (p.borderWidth = parseInt(e.target.value)))
              }
              style={{ width: "100%" }}
            />
          </div>

          {/* Border Color */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Color de borde
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="color"
                value={props.borderColor || "#e5e7eb"}
                onChange={(e) => setProp((p: ContainerProps) => (p.borderColor = e.target.value))}
                style={{
                  width: "40px",
                  height: "32px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              <input
                type="text"
                value={props.borderColor || ""}
                onChange={(e) =>
                  setProp((p: ContainerProps) => (p.borderColor = e.target.value || undefined))
                }
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Flex Direction */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Dirección de contenido
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {["column", "row"].map((dir) => (
            <button
              key={dir}
              onClick={() =>
                setProp(
                  (p: ContainerProps) => (p.flexDirection = dir as ContainerProps["flexDirection"])
                )
              }
              style={{
                flex: 1,
                padding: "8px",
                border: `1px solid ${props.flexDirection === dir ? "#3b82f6" : "#d1d5db"}`,
                borderRadius: "6px",
                background: props.flexDirection === dir ? "#eff6ff" : "#fff",
                color: props.flexDirection === dir ? "#3b82f6" : "#374151",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {dir === "column" ? "Vertical" : "Horizontal"}
            </button>
          ))}
        </div>
      </div>

      {/* Justify Content */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Alineación horizontal
        </label>
        <select
          value={props.justifyContent || "flex-start"}
          onChange={(e) =>
            setProp(
              (p: ContainerProps) =>
                (p.justifyContent = e.target.value as ContainerProps["justifyContent"])
            )
          }
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="flex-start">Inicio</option>
          <option value="center">Centro</option>
          <option value="flex-end">Final</option>
          <option value="space-between">Espaciado</option>
          <option value="space-around">Alrededor</option>
        </select>
      </div>

      {/* Align Items */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Alineación vertical
        </label>
        <select
          value={props.alignItems || "stretch"}
          onChange={(e) =>
            setProp(
              (p: ContainerProps) => (p.alignItems = e.target.value as ContainerProps["alignItems"])
            )
          }
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="flex-start">Inicio</option>
          <option value="center">Centro</option>
          <option value="flex-end">Final</option>
          <option value="stretch">Estirar</option>
        </select>
      </div>

      {/* Gap */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "6px",
            color: "#374151",
          }}
        >
          Espacio entre elementos: {props.gap || 0}px
        </label>
        <input
          type="range"
          min={0}
          max={64}
          value={props.gap || 0}
          onChange={(e) => setProp((p: ContainerProps) => (p.gap = parseInt(e.target.value)))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

Container.craft = {
  displayName: "Contenedor",
  props: {},
  related: {
    settings: ContainerSettings,
  },
};
