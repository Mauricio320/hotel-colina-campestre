import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Cargando...', 
  className = 'flex flex-col items-center justify-center p-24 gap-4' 
}) => {
  return (
    <div className={className}>
      <ProgressSpinner strokeWidth="4" />
      <p className="text-emerald-600 font-bold animate-pulse">
        {message}
      </p>
    </div>
  );
};