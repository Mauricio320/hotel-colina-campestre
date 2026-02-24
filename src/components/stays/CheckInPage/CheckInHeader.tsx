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
      className={`animate-fade-in sticky top-[-38px] z-40 mb-8 flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center`}
    >
      <div
        className={`absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full opacity-50 bg-${color}`}
      ></div>

      <div className="relative z-10 flex w-full items-center gap-4">
        <Button
          unstyled
          icon="pi pi-arrow-left"
          onClick={onBack}
          className="p-button-rounded w-10 h-10 rounded-2xl p-button-text p-button-secondary border border-gray-100 bg-gray-50 text-gray-600 shadow-sm transition-all duration-300 hover:bg-blue-50 hover:text-blue-600"
          tooltip="Volver al calendario"
          tooltipOptions={{ position: "bottom" }}
        />

        <div className="flex flex-1 items-stretch gap-4">
          <div
            className={`w-1.5 bg-${color} self-stretch rounded-full shadow-sm shadow-blue-100`}
          ></div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-3xl leading-none font-black tracking-tighter text-gray-900">
              {title}
            </h1>

            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2 font-bold text-gray-500">
                <i className={`pi pi-building text-${color}`}></i>
                <span className="text-sm">{subtitle}</span>
              </div>

              {observation && (
                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1">
                  <i className={`pi pi-info-circle text-xs text-${color}`}></i>
                  <span className="text-[10px] font-black tracking-wider text-amber-700 uppercase">
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
