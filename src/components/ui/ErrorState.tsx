import React from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Se perdió la conexión con la base de datos temporalmente.',
  onRetry,
  onRefresh,
  className = 'p-8'
}) => {
  return (
    <div className={className}>
      <Message
        severity="error"
        text={message}
        className="w-full"
      />
      <div className="mt-4 flex flex-col items-center gap-2">
        {onRetry && (
          <Button
            label="Reintentar ahora"
            icon="pi pi-refresh"
            onClick={onRetry}
          />
        )}
        {onRefresh && (
          <Button
            label="Refrescar Página"
            className="p-button-text text-gray-400"
            onClick={onRefresh}
          />
        )}
      </div>
    </div>
  );
};