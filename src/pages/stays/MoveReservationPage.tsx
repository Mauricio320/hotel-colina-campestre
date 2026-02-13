import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { useStayById } from "@/hooks/useStayById";
import { RoomsQueryCategory } from "@/hooks/useRooms";
import { useMoveStay, useCheckRoomAvailability } from "@/hooks/useMoveStay";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/ui/PageHeader";
import AvailabilityConflictModal from "@/components/stays/AvailabilityConflictModal";
import dayjs from "dayjs";
import { Room, Stay } from "@/types";

interface RoomOption {
  label: string;
  value: string;
  room: Room;
}

interface MoveReservationFormData {
  selectedRoomId: string;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  observation: string;
}

const MoveReservationPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { employee } = useAuth();

  const roomIdFromUrl = searchParams.get("room_id");
  const tabParam = searchParams.get("tab");
  const accommodation_type_id = searchParams.get("accommodation_type_id");

  const {
    data: stay,
    isLoading: stayLoading,
    error: stayError,
  } = useStayById(stayId || null);
  const { data: roomsQuery } = RoomsQueryCategory(accommodation_type_id);
  const moveStay = useMoveStay();
  const checkAvailability = useCheckRoomAvailability();

  // Estado para conflictos de disponibilidad
  const [conflicts, setConflicts] = useState<Stay[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MoveReservationFormData>({
    mode: "onChange",
    defaultValues: {
      selectedRoomId: "",
      checkInDate: null,
      checkOutDate: null,
      observation: "",
    },
  });

  const selectedRoomId = watch("selectedRoomId");
  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");

  useEffect(() => {
    if (stay) {
      reset({
        selectedRoomId: stay.room_id || "",
        checkInDate: stay.check_in_date ? new Date(stay.check_in_date) : null,
        checkOutDate: stay.check_out_date
          ? new Date(stay.check_out_date)
          : null,
        observation: "",
      });
    }
  }, [stay, reset]);

  const navigateToCalendar = () => {
    navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
  };

  const roomOptions: RoomOption[] =
    roomsQuery?.map((room) => ({
      label: `Hab. ${room.room_number} - ${room.accommodation_types?.name || "Sin tipo"}`,
      value: room.id,
      room,
    })) || [];

  const selectedRoom = roomOptions.find(
    (opt) => opt.value === selectedRoomId,
  )?.room;
  const currentRoom = stay?.room;
  const isRoomChanged = currentRoom?.id !== selectedRoomId;
  const isDatesChanged =
    stay &&
    checkInDate &&
    checkOutDate &&
    (dayjs(checkInDate).format("YYYY-MM-DD") !==
      dayjs(stay.check_in_date).format("YYYY-MM-DD") ||
      dayjs(checkOutDate).format("YYYY-MM-DD") !==
        dayjs(stay.check_out_date).format("YYYY-MM-DD"));

  const onSubmit = async (data: MoveReservationFormData) => {
    if (!stay || !stayId || !employee?.id) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    showBlockUI("Moviendo reserva...");
    try {
      await moveStay.mutateAsync({
        stayId: stayId,
        currentRoomId: roomIdFromUrl,
        newRoomId: data.selectedRoomId,
        newCheckInDate: dayjs(data.checkInDate).format("YYYY-MM-DD"),
        newCheckOutDate: dayjs(data.checkOutDate).format("YYYY-MM-DD"),
        moveDate: dayjs().format("YYYY-MM-DD"),
        employeeId: employee.id,
        observation: data.observation.trim() || undefined,
        stayStatusId: stay.room_status_id || "",
      });

      navigateToCalendar();
    } catch (error: any) {
      console.error("Error al mover reserva:", error);
    } finally {
      hideBlockUI();
    }
  };

  const handleCheckAndConfirm = async (data: MoveReservationFormData) => {
    if (!stay || !stayId) return;
    if (!data.checkInDate || !data.checkOutDate) return;

    try {
      // Verificar disponibilidad de la habitación seleccionada
      const result = await checkAvailability.mutateAsync({
        roomId: data.selectedRoomId,
        checkInDate: dayjs(data.checkInDate).format("YYYY-MM-DD"),
        checkOutDate: dayjs(data.checkOutDate).format("YYYY-MM-DD"),
        excludeStayId: stayId,
      });

      if (!result.available && result.conflictingStays) {
        // Transformar el resultado al formato esperado por el modal
        const formattedConflicts: Stay[] = result.conflictingStays.map(
          (conflict) =>
            ({
              id: conflict.id,
              order_number: conflict.order_number,
              check_in_date: conflict.check_in_date,
              check_out_date: conflict.check_out_date,
              guest: {
                first_name: conflict.guest_name.split(" ")[0] || "",
                last_name:
                  conflict.guest_name.split(" ").slice(1).join(" ") || "",
              },
              room: conflict.room
                ? {
                    id: conflict.room.id,
                    room_number: conflict.room.room_number,
                  }
                : undefined,
            }) as Stay,
        );
        setConflicts(formattedConflicts);
        setShowConflictModal(true);
        return;
      }

      // Si no hay conflictos, mostrar confirmación
      const changes: string[] = [];
      if (isRoomChanged) {
        changes.push(`habitación a ${selectedRoom?.room_number}`);
      }
      if (isDatesChanged) {
        changes.push(
          `fechas a ${dayjs(data.checkInDate).format("DD/MM/YYYY")} - ${dayjs(data.checkOutDate).format("DD/MM/YYYY")}`,
        );
      }

      confirmDialog({
        message: `¿Está seguro que desea mover esta reserva? Se cambiará ${changes.join(" y ")}.`,
        header: "Confirmar movimiento",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Sí, mover",
        rejectLabel: "No, volver",
        acceptIcon: "pi pi-check",
        rejectIcon: "pi pi-times",
        acceptClassName: "p-button-warning",
        accept: () => onSubmit(data),
      });
    } catch (error: any) {
      console.error("Error al verificar disponibilidad:", error);
    }
  };

  if (stayLoading || !roomsQuery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ProgressSpinner />
        <p className="text-gray-500">Cargando reserva...</p>
      </div>
    );
  }

  if (stayError || !stay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <i className="pi pi-exclamation-circle text-5xl text-red-500"></i>
        <h3 className="text-xl font-bold text-gray-800 text-center">
          Reserva no encontrada
        </h3>
        <p className="text-gray-500 text-center">
          No se pudo cargar la reserva. Verifica la URL.
        </p>
        {stayError && (
          <p className="text-xs text-red-400 text-center max-w-xs">
            Error: {stayError.message}
          </p>
        )}
      </div>
    );
  }

  const displayDate = dayjs().format("DD/MM/YYYY");
  const guestName = stay.guest
    ? `${stay.guest.first_name} ${stay.guest.last_name}`
    : "Sin huésped";
  const roomNumber = stay.room?.room_number || "-";
  const currentCheckInDate = stay.check_in_date
    ? dayjs(stay.check_in_date).format("DD/MM/YYYY")
    : "-";
  const currentCheckOutDate = stay.check_out_date
    ? dayjs(stay.check_out_date).format("DD/MM/YYYY")
    : "-";
  const totalPrice =
    stay.total_price?.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }) || "$0";

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in px-4 sm:px-6">
      <ConfirmDialog />
      <AvailabilityConflictModal
        visible={showConflictModal}
        onHide={() => setShowConflictModal(false)}
        conflicts={conflicts}
        context="move"
      />
      <PageHeader
        title={`Reserva #${stay.order_number || "-"}`}
        subtitle={displayDate}
        icon="pi-calendar"
        tag="Mover"
        color="amber"
        onBack={navigateToCalendar}
        backTooltip="Volver al calendario"
      />

      <Card className="shadow-md border-0">
        <form
          onSubmit={handleSubmit(handleCheckAndConfirm)}
          className="flex flex-col gap-6"
        >
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-3">
              Información actual de la reserva
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Habitación</p>
                <p className="font-bold text-gray-800">{roomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Huésped</p>
                <p className="font-bold text-gray-800">{guestName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entrada actual</p>
                <p className="font-bold text-gray-800">{currentCheckInDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salida actual</p>
                <p className="font-bold text-gray-800">{currentCheckOutDate}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold text-lg text-gray-800">{totalPrice}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wide">
              Nuevos datos de la reserva
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Habitación <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="selectedRoomId"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={roomOptions}
                    placeholder="Seleccionar habitación"
                    className={`w-full ${errors.selectedRoomId ? "p-invalid" : ""}`}
                    panelClassName="rounded-xl"
                  />
                )}
              />
              {errors.selectedRoomId && (
                <p className="text-xs text-red-500">
                  {errors.selectedRoomId.message}
                </p>
              )}
              {isRoomChanged && (
                <p className="text-xs text-amber-600 font-medium">
                  <i className="pi pi-info-circle mr-1"></i>
                  Se cambiará de habitación {currentRoom?.room_number} a{" "}
                  {selectedRoom?.room_number}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de entrada{" "}
                  <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="checkInDate"
                  control={control}
                  rules={{ required: "Campo requerido" }}
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value as Date)}
                      dateFormat="dd/mm/yy"
                      placeholder="Seleccionar fecha"
                      className={`w-full ${errors.checkInDate ? "p-invalid" : ""}`}
                      showIcon
                      iconPos="right"
                      minDate={new Date()}
                    />
                  )}
                />
                {errors.checkInDate && (
                  <p className="text-xs text-red-500">
                    {errors.checkInDate.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Nueva fecha de salida{" "}
                  <span className="text-amber-500">*</span>
                </label>
                <Controller
                  name="checkOutDate"
                  control={control}
                  rules={{
                    required: "Campo requerido",
                    validate: (value) => {
                      if (!value || !checkInDate) return true;
                      return (
                        dayjs(value).isAfter(dayjs(checkInDate)) ||
                        "La fecha de salida debe ser posterior a la fecha de entrada"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value as Date)}
                      dateFormat="dd/mm/yy"
                      placeholder="Seleccionar fecha"
                      className={`w-full ${errors.checkOutDate ? "p-invalid" : ""}`}
                      showIcon
                      iconPos="right"
                      minDate={checkInDate || new Date()}
                    />
                  )}
                />
                {errors.checkOutDate && (
                  <p className="text-xs text-red-500">
                    {errors.checkOutDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Observación <span className="text-amber-500">*</span>
              </label>
              <Controller
                name="observation"
                control={control}
                rules={{ required: "Campo requerido" }}
                render={({ field }) => (
                  <InputTextarea
                    {...field}
                    placeholder="Ingrese alguna observación sobre el movimiento..."
                    rows={3}
                    className={`w-full border-gray-200 rounded-xl ${errors.observation ? "p-invalid" : ""}`}
                  />
                )}
              />
              {errors.observation && (
                <p className="text-xs text-red-500">
                  {errors.observation.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            label="Mover Reserva"
            icon="pi pi-calendar-plus"
            className="bg-amber-500 hover:bg-amber-600 border-none text-white w-full py-4 text-lg font-black rounded-2xl shadow-lg mt-2"
            disabled={moveStay.isPending || checkAvailability.isPending}
            loading={moveStay.isPending || checkAvailability.isPending}
          />

          {moveStay.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <i className="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
              <div>
                <p className="text-sm font-bold text-red-700">
                  Error al mover la reserva
                </p>
                <p className="text-xs text-red-600">
                  {(moveStay.error as Error).message}
                </p>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default MoveReservationPage;
