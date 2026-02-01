import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  data,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import GuestDataForm from "@/components/stays/GuestDataForm";
import PaymentSection from "@/components/stays/PaymentSection";
import StayDetailsForm from "@/components/stays/StayDetailsForm";
import { useUniversalRoomQuery } from "@/hooks/useUniversalRoomQuery";

import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useGuests } from "@/hooks/useGuests";
import { useStays } from "@/hooks/useStays";
import { useStayPricing } from "@/hooks/useStayPricing";
import { useColombiaGeography } from "@/hooks/useColombiaGeography";
import { useSettings, usePaymentMethods } from "@/hooks/useSettings";
import RoomInfoCard from "@/components/stays/CheckInPage/RoomInfoCard";
import {
  AccommodationTypeEnum,
  RoomStatusEnum,
} from "@/util/status-rooms.enum";
import { Room } from "@/types";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";

const CheckInPage: React.FC = () => {
  const { colombiaData, loadingGeo } = useColombiaGeography();
  const { createStayWithPayment } = useStays();
  const { findGuestByDoc, upsertGuest } = useGuests();
  const { data: roomStatuses } = useRoomStatuses();

  const { showBlockUI, hideBlockUI } = useBlockUI();
  const {
    settings,
    isLoading: isSettingsLoading,
    error: settingsError,
  } = useSettings();
  const {
    paymentMethods,
    isLoading: isPaymentMethodsLoading,
    error: paymentMethodsError,
  } = usePaymentMethods();

  const { employee } = useAuth();

  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab");
  const action = searchParams.get("action") as AccommodationTypeEnum;

  const {
    data: universalData,
    isLoading,
    error,
  } = useUniversalRoomQuery(roomId, action);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [guestNotFound, setGuestNotFound] = useState(false);
  const [guestFound, setGuestFound] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{
    type: "success" | "info" | null;
    text: string;
  }>({ type: null, text: "" });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      doc_type: "CC",
      doc_number: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      department: "",
      city: "",
      address: "",
      check_in_date: searchParams.get("date")
        ? new Date(searchParams.get("date")! + "T12:00:00")
        : new Date(),
      check_out_date: null as Date | null,
      person_count: 1,
      extra_mattress_count: 0,
      is_invoice_requested: false,
      observation: "",
      payment_method_id: "",
      paid_amount: 0,
    },
  });

  const personCount = watch("person_count");
  const checkInDate = watch("check_in_date");
  const checkOutDate = watch("check_out_date");
  const extraMattressCount = watch("extra_mattress_count");
  const invoiceRequested = watch("is_invoice_requested");
  const watchDocNumber = watch("doc_number");
  const selectedDepartment = watch("department");

  useEffect(() => {
    if (paymentMethods?.length > 0)
      setValue("payment_method_id", paymentMethods[0].id);
  }, [paymentMethods]);

  const cityOptions = useMemo(() => {
    if (!selectedDepartment || !colombiaData.length) return [];
    const dept = colombiaData.find(
      (d) => d.departamento === selectedDepartment,
    );
    return dept ? dept.ciudades : [];
  }, [selectedDepartment, colombiaData]);

  const searchGuest = async () => {
    if (searching) return;
    if (watchDocNumber.length < 5) return;

    setGuestNotFound(false);
    setGuestFound(false);
    setSearchMessage({ type: null, text: "" });

    setValue("first_name", "");
    setValue("last_name", "");
    setValue("phone", "");
    setValue("email", "");
    setValue("address", "");
    setValue("department", "");
    setValue("city", "");
    setValue("doc_type", "CC");

    setSearching(true);
    showBlockUI("Buscando huésped...");

    try {
      const guest = await findGuestByDoc(watchDocNumber);
      if (guest) {
        setValue("first_name", guest.first_name);
        setValue("last_name", guest.last_name);
        setValue("phone", guest.phone || "");
        setValue("email", guest.email || "");
        setValue("address", guest.address || "");
        setValue("doc_type", guest.doc_type);

        if (guest.city) {
          const deptFound = colombiaData.find((d) =>
            d.ciudades.includes(guest.city),
          );
          if (deptFound) {
            setValue("department", deptFound.departamento);
            setTimeout(() => setValue("city", guest.city), 0);
          } else {
            setValue("city", guest.city);
          }
        }

        setGuestFound(true);
        setSearchMessage({
          type: "success",
          text: `Huésped ${guest.first_name} ${guest.last_name} encontrado. Puede actualizar su información si es necesario.`,
        });
      } else {
        setGuestNotFound(true);
        setSearchMessage({
          type: "info",
          text: "No se encontró ningún huésped con ese número de documento. Por favor llene los demás campos para registrar un nuevo huésped.",
        });
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      showBlockUI("Error al buscar huésped");
      setTimeout(hideBlockUI, 2000);
    } finally {
      hideBlockUI();
      setTimeout(() => setSearching(false), 0);
    }
  };

  const { nights, priceInfo } = useStayPricing({
    room: universalData,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested,
    settings,
  });

  useEffect(() => {
    setValue("paid_amount", priceInfo.total);
  }, [priceInfo.total, setValue]);

  const onSubmit = async (data: any) => {
    if (!data.check_out_date) return alert("Seleccione una fecha de salida");

    setLoading(true);
    try {
      const guest = await upsertGuest.mutateAsync({
        doc_type: data.doc_type,
        doc_number: data.doc_number,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        address: data.address,
      });

      const isApartmentAction = action === AccommodationTypeEnum.APARTAMENTO;
      const roomStatusId = roomStatuses?.find(
        (rs) => rs.name === RoomStatusEnum.OCUPADO,
      )?.id;

      await createStayWithPayment.mutateAsync({
        stayData: {
          guest_id: guest.id,
          employee_id: employee?.id || null,
          check_in_date: data.check_in_date.toLocaleDateString("sv-SE"),
          check_out_date: data.check_out_date.toLocaleDateString("sv-SE"),
          status: "Active",
          total_price: priceInfo.total,
          paid_amount: data.paid_amount,
          payment_method_id: data.payment_method_id,
          has_extra_mattress: data.extra_mattress_count > 0,
          extra_mattress_price: data.extra_mattress_count * settings.mat,
          is_invoice_requested: data.is_invoice_requested,
          iva_amount: priceInfo.iva,
          observation: data.observation,
          origin_was_reservation: false,
          iva_percentage: settings.iva,
          person_count: data.person_count,
          extra_mattress_count: data.extra_mattress_count,
          extra_mattress_unit_price: settings.mat,
          room_status_id: roomStatusId,
          ...(isApartmentAction
            ? { accommodation_type_id: roomId }
            : { room_id: roomId }),
        },
        paymentData: {
          amount: priceInfo.total,
          payment_method_id: data.payment_method_id,
          employee_id: employee?.id || null,
          context: "checkin_direct",
          customObservation: "Pago completo check-in directo",
        },
      });

      // navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const accommodationTitleLabel = useMemo(() => {
    if (!universalData) return "";

    const isRoomType = "room_number" in universalData;
    if (isRoomType) {
      return `${universalData.category} | HAB ${universalData.room_number}`;
    }

    return universalData.name;
  }, [universalData]);

  const accommodationObservationLabel = useMemo(() => {
    return universalData?.["observation"] || "";
  }, [universalData]);

  if (!universalData && !isLoading)
    return <div className="p-8">Habitación no encontrada</div>;

  if (isLoading || loadingGeo)
    return (
      <div className="flex justify-center p-24">
        <ProgressSpinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          icon="pi pi-arrow-left"
          onClick={() =>
            navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar")
          }
          className="p-button-text p-button-plain p-button-rounded text-gray-400"
        />
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Check-in
          </h1>
          <p className="text-gray-500 font-medium">
            {accommodationTitleLabel}{" "}
            {accommodationObservationLabel &&
              `- ${accommodationObservationLabel}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <GuestDataForm
          register={register}
          control={control}
          setValue={setValue}
          searching={searching}
          searchGuest={searchGuest}
          cityOptions={cityOptions}
          selectedDepartment={selectedDepartment}
          colombiaData={colombiaData}
          guestNotFound={guestNotFound}
          guestFound={guestFound}
          searchMessage={searchMessage}
          watchDocNumber={watchDocNumber}
        />

        <StayDetailsForm
          title="Detalles de la Estadía"
          control={control}
          register={register}
          setValue={setValue}
          watch={watch}
          checkInDate={checkInDate}
          maxCapacity={2}
          settings={settings}
        />

        <PaymentSection
          title="Pago"
          priceInfo={priceInfo}
          nights={nights}
          personCount={personCount}
          extraMattressCount={extraMattressCount}
          settings={settings}
          paymentMethods={paymentMethods}
          control={control}
          setValue={setValue}
          watch={watch}
          isReservation={false}
        />

        {/* Footer Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Button
            type="button"
            label="Cancelar"
            className="p-button p-button-outlined w-full"
            onClick={() =>
              navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar")
            }
          />
          <Button
            type="submit"
            label="Confirmar Check-in"
            className="p-button p-button-success w-full"
          />
        </div>
      </form>
    </div>
  );
};

export default CheckInPage;
