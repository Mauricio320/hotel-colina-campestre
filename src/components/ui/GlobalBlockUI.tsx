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
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-fade-in max-w-sm mx-4">
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth="4"
          fill="transparent"
          animationDuration=".5s"
        />
        {message && (
          <p className="text-gray-700 font-bold text-center text-lg animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlobalBlockUI;
