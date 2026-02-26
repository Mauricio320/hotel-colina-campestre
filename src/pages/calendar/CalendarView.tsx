import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { RoomActionModal } from "@/components/calendar/RoomActionModal";
import PageHeader from "@/components/ui/PageHeader";
import { SkeletonUI } from "@/components/ui/SkeletonUI";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Room, Stay } from "@/types";
import { RoomActionEnum } from "@/util/enums/status-rooms.enum";
import dayjs from "dayjs";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ModalData {
  visible: boolean;
  room: Room | null;
  activeStay: Stay | null;
  selectedDate: Date | null;
  roomAction: RoomActionEnum | null;
  accommodationType: any;
}

const CalendarView: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().toDate());
  const [modalData, setModalData] = useState<ModalData>({
    visible: false,
    room: null,
    activeStay: null,
    selectedDate: null,
    roomAction: null,
    accommodationType: null,
  });

  const { parseTabParam, scrollToTabView } = useUrlParams();

  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

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

  if (accommodationTypesQuery.isLoading) return <SkeletonUI />;

  const handleRoomClick = (
    room: Room,
    date: Date,
    stay: Stay | null,
    action: RoomActionEnum,
    accommodationType: any
  ) => {
    setModalData({
      selectedDate: date,
      roomAction: action,
      accommodationType,
      activeStay: stay,
      visible: true,
      room,
    });
  };

  const handleCloseModal = () => {
    setModalData((prev) => ({ ...prev, visible: false }));
  };

  const handleGoToCheckOut = () => {
    const stay = modalData.activeStay;
    if (!stay?.id) return;

    const accommodationTypeEnum = stay?.room_id ? "HABITACION" : "APARTAMENTO";
    const params = [`tab=${activeTab}`, `action=${accommodationTypeEnum}`];
    const url = `/check-out/${stay.id}?${params.join("&")}`;
    navigate(url);
  };

  const handleCheckInAction = () => {
    const stay = modalData.activeStay;
    if (!stay?.id) return;

    const params = [`tab=${activeTab}`];
    const url = `/check-in-payment/${stay.id}?${params.join("&")}`;
    navigate(url);
  };

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
              onStartDateChange={setStartDate}
              onRoomClick={handleRoomClick}
              accommodationType={type}
              activeTab={activeTab}
              startDate={startDate}
              days={days}
            />
          </TabPanel>
        ))}
      </TabView>

      <RoomActionModal
        accommodationType={modalData.accommodationType}
        onConfirmCheckIn={handleCheckInAction}
        onCheckInAction={handleCheckInAction}
        onGoToCheckOut={handleGoToCheckOut}
        activeStay={modalData.activeStay}
        action={modalData.roomAction}
        date={modalData.selectedDate}
        visible={modalData.visible}
        onHide={handleCloseModal}
        activeTab={activeTab}
        room={modalData.room}
      />
    </div>
  );
};

export default CalendarView;
