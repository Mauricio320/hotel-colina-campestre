import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { OverlayPanel } from "primereact/overlaypanel";
import dayjs from "dayjs";
import React, { useRef } from "react";

interface CalendarHeaderProps {
  startDate: Date;
  onStartDateChange: (date: Date) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  startDate,
  onStartDateChange,
}) => {
  const overlayRef = useRef<OverlayPanel>(null);
  const endDate = dayjs(startDate).add(6, "day").toDate();

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

  const isSameMonth = dayjs(startDate).isSame(dayjs(endDate), "month");
  const isSameYear = dayjs(startDate).isSame(dayjs(endDate), "year");

  const formatDateRange = () => {
    const startDay = dayjs(startDate).format("D");
    const endDay = dayjs(endDate).format("D");
    const startMonth = dayjs(startDate).format("MMM");
    const endMonth = dayjs(endDate).format("MMM");
    const year = dayjs(endDate).format("YYYY");

    if (isSameMonth && isSameYear) {
      return `${startDay} - ${endDay} ${startMonth} ${year}`;
    }

    if (!isSameMonth && isSameYear) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }

    return `${startDay} ${startMonth} ${dayjs(startDate).format("YYYY")} - ${endDay} ${endMonth} ${year}`;
  };

  const handleDateSelect = (e: { value: Date }) => {
    if (e.value) {
      onStartDateChange(e.value);
      overlayRef.current?.hide();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
        <Button
          icon="pi pi-chevron-left"
          onClick={handlePreviousWeek}
          className="p-button-text p-button-sm"
        />
        <div
          className="px-4 py-2 min-w-[180px] text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          onClick={(e) => overlayRef.current?.toggle(e)}
        >
          <span className="text-sm font-bold text-gray-700">
            {formatDateRange()}
          </span>
        </div>
        <Button
          icon="pi pi-chevron-right"
          onClick={handleNextWeek}
          className="p-button-text p-button-sm"
        />
      </div>

      <OverlayPanel ref={overlayRef} dismissable>
        <Calendar
          value={startDate}
          onChange={handleDateSelect}
          inline
          showWeek
        />
      </OverlayPanel>
    </div>
  );
};
