import { useEditor } from "@craftjs/core";
import React from "react";

export const SettingsPanel = () => {
  const {
    selected,
    nodeName,
    settings: SettingsComponent,
  } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    const currentNode = currentNodeId ? state.nodes[currentNodeId] : null;

    return {
      selected: currentNodeId,
      nodeName: currentNode?.data?.displayName || currentNode?.data?.name,
      settings: currentNode?.related?.settings,
    };
  });

  return (
    <div className="w-80 bg-white shadow-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-bold text-gray-800">
          {selected ? "Propiedades" : "Selecciona un componente"}
        </h3>
        {selected && <p className="text-sm text-gray-500">{nodeName}</p>}
      </div>
      <div className="p-4">
        {selected ? (
          SettingsComponent ? (
            <SettingsComponent />
          ) : (
            <p className="text-sm text-gray-500">Este componente no tiene propiedades editables</p>
          )
        ) : (
          <p className="text-sm text-gray-500">
            Haz clic en un componente para editar sus propiedades
          </p>
        )}
      </div>
    </div>
  );
};
