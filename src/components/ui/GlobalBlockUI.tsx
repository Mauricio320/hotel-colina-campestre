import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";

interface GlobalBlockUIProps {
  visible: boolean;
  message?: string;
}

const GlobalBlockUI: React.FC<GlobalBlockUIProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-200">
      <div className="animate-fade-in mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="4"
          fill="transparent"
          animationDuration=".5s"
        />
        {message && (
          <p className="animate-pulse text-center text-lg font-bold text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default GlobalBlockUI;
