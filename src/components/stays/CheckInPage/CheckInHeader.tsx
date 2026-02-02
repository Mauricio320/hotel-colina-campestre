import React from "react";
import { Button } from "primereact/button";

interface CheckInHeaderProps {
  onBack: () => void;
  title: string;
  subtitle: string;
  observation?: string;
  color?: "yellow-500" | "emerald-500";
}

const CheckInHeader: React.FC<CheckInHeaderProps> = ({
  onBack,
  title,
  subtitle,
  observation,
  color = "bg-yellow-500",
}) => {
  return (
    <div
      className={`sticky top-[-38px] z-40 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in  overflow-hidden `}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 bg-${color}`}
      ></div>

      <div className="relative z-10 flex items-center gap-4 w-full">
        <Button
          icon="pi pi-arrow-left"
          onClick={onBack}
          className="p-button-rounded p-button-text p-button-secondary bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 shadow-sm border border-gray-100"
          tooltip="Volver al calendario"
          tooltipOptions={{ position: "bottom" }}
        />

        <div className="flex items-stretch gap-4 flex-1">
          <div
            className={`w-1.5 bg-${color} rounded-full shadow-sm shadow-blue-100 self-stretch`}
          ></div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
              {title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
              <div className="flex items-center gap-2 text-gray-500 font-bold">
                <i className={`pi pi-building text-${color}`}></i>
                <span className="text-sm">{subtitle}</span>
              </div>

              {observation && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                  <i className={`pi pi-info-circle text-xs text-${color}`}></i>
                  <span className="text-amber-700 text-[10px] font-black uppercase tracking-wider">
                    {observation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInHeader;
