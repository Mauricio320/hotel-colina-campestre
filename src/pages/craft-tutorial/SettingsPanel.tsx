import React from "react";
import { useEditor } from "@craftjs/core";

export const SettingsPanel = () => {
  const { selected, nodeName, settings } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    const currentNode = currentNodeId ? state.nodes[currentNodeId] : null;

    return {
      selected: currentNodeId,
      nodeName: currentNode?.data?.displayName || currentNode?.data?.name,
      settings: currentNode?.related?.settings,
    };
  });

  return (
    <div style={{ width: "280px", background: "#fff", borderLeft: "1px solid #e5e7eb" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
          {selected ? "Configurar" : "Selecciona un elemento"}
        </h3>
        {selected && (
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
            {nodeName}
          </p>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        {selected ? (
          settings ? (
            React.createElement(settings)
          ) : (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Este elemento no tiene propiedades editables
            </p>
          )
        ) : (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Haz clic en un elemento del canvas para editar sus propiedades
          </p>
        )}
      </div>
    </div>
  );
};
