import React from "react";
import { Button } from "primereact/button";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "pi pi-info-circle",
  title = "No hay datos",
  message = "No se encontraron elementos para mostrar.",
  action,
  className = "flex flex-col items-center justify-center p-16 gap-4 text-center",
}) => {
  return (
    <div className={className}>
      <div className="mb-4 text-4xl text-gray-400">
        <i className={icon}></i>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-700">{title}</h3>
      <p className="mb-6 text-gray-500">{message}</p>
      {action && (
        <Button
          unstyled
          label={action.label}
          onClick={action.onClick}
          className="p-button-outlined"
        />
      )}
    </div>
  );
};
