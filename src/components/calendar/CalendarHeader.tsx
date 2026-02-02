import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import React from "react";

interface CalendarHeaderProps {
  startDate: Date;
  onStartDateChange: (date: Date) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  startDate,
  onStartDateChange,
}) => {
  const handlePreviousWeek = () => {
    const nd = new Date(startDate);
    nd.setDate(nd.getDate() - 7);
    onStartDateChange(nd);
  };

  const handleNextWeek = () => {
    const nd = new Date(startDate);
    nd.setDate(nd.getDate() + 7);
    onStartDateChange(nd);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Calendario de Ocupación
      </h2>
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
        <Button
          icon="pi pi-chevron-left"
          onClick={handlePreviousWeek}
          className="p-button-text p-button-sm"
        />
        <Calendar
          value={startDate}
          onChange={(e) => e.value && onStartDateChange(e.value)}
          showIcon
          className="p-inputtext-sm"
        />
        <Button
          icon="pi pi-chevron-right"
          onClick={handleNextWeek}
          className="p-button-text p-button-sm"
        />
      </div>
    </div>
  );
};
