import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { SkeletonUI } from "@/components/ui/SkeletonUI";
import PageHeader from "@/components/ui/PageHeader";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { useRooms } from "@/hooks/useRooms";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useStays } from "@/hooks/useStays";
import { useUrlParams } from "@/hooks/useUrlParams";
import dayjs from "dayjs";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useMemo, useState } from "react";

const CalendarView: React.FC = () => {
  const { showBlockUI } = useBlockUI();

  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().toDate());

  const { roomsQuery } = useRooms();
  const { staysQuery } = useStays();

  const roomStatuses = useRoomStatuses();

  const { parseTabParam, scrollToTabView } = useUrlParams();

  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  const isLoading =
    roomsQuery.isLoading ||
    staysQuery.isLoading ||
    roomStatuses.isLoading ||
    accommodationTypesQuery.isLoading;

  useEffect(() => {
    showBlockUI(`Cargando Calendario`);
  }, []);

  useEffect(() => {
    const tabIndex = parseTabParam(accommodationTypesQuery.data?.length || 0);
    if (tabIndex !== 0) {
      setActiveTab(tabIndex);
      scrollToTabView();
    }
  }, [accommodationTypesQuery.data]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return dayjs(startDate).add(i, "day").toDate();
    });
  }, [startDate]);

  if (isLoading) return <SkeletonUI />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendario de Ocupación"
        icon="pi-calendar"
        color="blue"
        variant="simple"
      />

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {accommodationTypesQuery.data?.map((type) => (
          <TabPanel key={type.id} header={type.name}>
            <CalendarGrid
              roomStatuses={roomStatuses?.data || []}
              accommodationType={type}
              activeTab={activeTab}
              days={days}
              startDate={startDate}
              onStartDateChange={setStartDate}
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default CalendarView;
