import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonUI } from "@/components/ui/SkeletonUI";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useRooms } from "@/hooks/useRooms";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useStays } from "@/hooks/useStays";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Room } from "@/types";
import dayjs from "dayjs";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useMemo, useState } from "react";

const CalendarView: React.FC = () => {
  const { showBlockUI, hideBlockUI } = useBlockUI();

  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().toDate());

  const { roomsQuery } = useRooms();
  const { staysQuery } = useStays();

  const roomStatuses = useRoomStatuses();
  const paymentMethods = usePaymentMethods();

  const { parseTabParam, scrollToTabView } = useUrlParams();

  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  const isLoading =
    (roomsQuery.isLoading && !roomsQuery.data) ||
    (staysQuery.isLoading && !staysQuery.data) ||
    roomStatuses.isLoading ||
    paymentMethods.fetchAll.isLoading ||
    accommodationTypesQuery.isLoading;

  const isError = roomsQuery.isError || staysQuery.isError;

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

  const getActiveStay = (room: Room, date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return staysQuery.data?.find(
      (s) =>
        s.room_id === room.id &&
        dateStr >= s.check_in_date &&
        dateStr <= s.check_out_date &&
        (s.status === "Active" || s.status === "Reserved"),
    );
  };

  if (isLoading) return <SkeletonUI />;

  if (isError)
    return (
      <ErrorState
        onRetry={() => {
          roomsQuery.refetch();
          staysQuery.refetch();
          roomStatuses.refetch();
          paymentMethods.fetchAll.refetch();
          accommodationTypesQuery.refetch();
        }}
        onRefresh={() => window.location.reload()}
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <CalendarHeader startDate={startDate} onStartDateChange={setStartDate} />

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {accommodationTypesQuery.data?.map((type) => (
          <TabPanel key={type.id} header={type.name}>
            <CalendarGrid
              refectCalendar={() => {
                setTimeout(() => {
                  roomsQuery.refetch().then(() => {
                    hideBlockUI();
                  });
                }, 500);
              }}
              roomStatuses={roomStatuses?.data || []}
              getActiveStay={getActiveStay}
              accommodationType={type}
              activeTab={activeTab}
              days={days}
            />
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default CalendarView;
