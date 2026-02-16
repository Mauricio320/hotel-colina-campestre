import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useMatch,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import AllGuestsForm from "@/components/stays/AllGuestsForm";
import PaymentSection from "@/components/stays/PaymentSection";
import StayDetailsForm from "@/components/stays/StayDetailsForm";
import { useUniversalRoomQuery } from "@/hooks/useUniversalRoomQuery";

import AvailabilityConflictModal from "@/components/stays/AvailabilityConflictModal";
import AdminAuthorizationModal from "@/components/stays/CheckInPage/AdminAuthorizationModal";
import CheckInHeader from "@/components/stays/CheckInPage/CheckInHeader";
import CorporateClientSelector from "@/components/stays/CheckInPage/CorporateClientSelector";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useColombiaGeography } from "@/hooks/useColombiaGeography";
import { useGuests } from "@/hooks/useGuests";
import { useRoomRates } from "@/hooks/useRoomRates";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { usePaymentMethods, useSettings } from "@/hooks/useSettings";
import { useStayPricing } from "@/hooks/useStayPricing";
import {
  CheckAvailability,
  useCreateOnStayWithPayment,
} from "@/hooks/useStays";
import { Employee, PaymentType, Stay } from "@/types";
import {
  AccommodationTypeEnum,
  RoomStatusEnum,
} from "@/util/enums/status-rooms.enum";
import { generateStayObservation } from "@/util/helper/stayHelpers";
import dayjs from "dayjs";
import { useCheckRoomAvailability } from "@/hooks/useMoveStay";
import { FormattedConflicts } from "@/util/helper/formattedConflicts";

const CheckInPage: React.FC = () => {
  const { colombiaData, loadingGeo } = useColombiaGeography();

  const { findGuestByDoc, upsertGuest } = useGuests();
  const { data: roomStatuses } = useRoomStatuses();
  const isCheckInMode = !!useMatch("/check-in/:roomId");

  const getStatusId = (name: RoomStatusEnum) =>
    roomStatuses?.find((rs) => rs.name === name)?.id;

  const { showBlockUI, hideBlockUI } = useBlockUI();
  const { settings } = useSettings();
  const { paymentMethods } = usePaymentMethods();
  const checkAvailability = useCheckRoomAvailability();
  const { employee } = useAuth();

  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get("tab");
  const action = searchParams.get("action") as AccommodationTypeEnum;

  const { data: roomRates } = useRoomRates(roomId);
  const { data: universalData, isLoading } = useUniversalRoomQuery(
    roomId,
    action,
  );

  const [searching, setSearching] = useState(false);
  const [guestNotFound, setGuestNotFound] = useState(false);
  const [guestFound, setGuestFound] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{
    type: "success" | "info" | null;
    text: string;
  }>({ type: null, text: "" });

  const [discountAmount, setDiscountAmount] = useState(0);
  const [authorizedBy, setAuthorizedBy] = useState<Employee | null>(null);
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const { control, register, handleSubmit, setValue, watch, setError } =
    useForm({
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
        room_status_current_id: null,
        new_status_id: null,
        additional_guests: [],
      },
    });

  const personCount = watch("person_count");
  const checkInDate = watch("check_in_date");
  const checkOutDate = watch("check_out_date");
  const extraMattressCount = watch("extra_mattress_count");
  const invoiceRequested = watch("is_invoice_requested");
  const watchDocNumber = watch("doc_number");
  const selectedDepartment = watch("department");

  // Actualizar array de huéspedes adicionales cuando cambia personCount
  useEffect(() => {
    const currentCount = watch("additional_guests")?.length || 0;
    const newCount = Math.max(0, personCount - 1);

    if (newCount !== currentCount) {
      if (newCount > currentCount) {
        // Agregar nuevos huéspedes al array
        const newGuests = Array.from(
          { length: newCount - currentCount },
          () => ({
            doc_type: "CC",
            doc_number: "",
            first_name: "",
            last_name: "",
            phone: "",
            email: "",
            city: "",
            address: "",
            department: "",
          }),
        );
        setValue("additional_guests", [
          ...(watch("additional_guests") || []),
          ...newGuests,
        ]);
      } else {
        // Recortar array
        setValue(
          "additional_guests",
          watch("additional_guests")?.slice(0, newCount) || [],
        );
      }
    }
  }, [personCount, setValue, watch]);

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
    room: universalData!,
    checkInDate,
    checkOutDate,
    personCount,
    extraMattressCount,
    invoiceRequested,
    settings,
    roomRates,
  });

  const finalPriceInfo = useMemo(() => {
    return {
      ...priceInfo,
      total: Math.max(0, priceInfo.total - discountAmount),
      discountAmount: discountAmount,
    };
  }, [priceInfo, discountAmount]);

  useEffect(() => {
    setValue("paid_amount", finalPriceInfo.total);
  }, [finalPriceInfo.total, setValue]);

  const onSubmit = async (data: any) => {
    if (!data.check_out_date) return alert("Seleccione una fecha de salida");
    showBlockUI("Procesando check-in...");
    if (!(await verifyStay(data))) return;

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

      const additionalGuests = data.additional_guests || [];
      const additionalGuestIds: string[] = [];

      for (const additionalGuest of additionalGuests) {
        if (additionalGuest.doc_number && additionalGuest.first_name) {
          const savedGuest = await upsertGuest.mutateAsync({
            doc_type: additionalGuest.doc_type || "CC",
            doc_number: additionalGuest.doc_number,
            first_name: additionalGuest.first_name,
            last_name: additionalGuest.last_name,
            phone: additionalGuest.phone,
            email: additionalGuest.email,
            city: additionalGuest.city,
            address: additionalGuest.address,
          });
          additionalGuestIds.push(savedGuest.id);
        }
      }

      const isApartmentAction = action === AccommodationTypeEnum.APARTAMENTO;

      const room_status_current_id = getStatusId(RoomStatusEnum.DISPONIBLE);
      const new_status_id = isCheckInMode
        ? getStatusId(RoomStatusEnum.OCUPADO)
        : getStatusId(RoomStatusEnum.RESERVADO);

      const observation = generateStayObservation({
        isCheckIn: isCheckInMode,
        paidAmount: data.paid_amount,
        totalAmount: finalPriceInfo.total,
        discountAmount,
        authorizedBy,
      });

      const keyId = isApartmentAction
        ? { accommodation_type_id: roomId }
        : { room_id: roomId };

      await useCreateOnStayWithPayment({
        stay: {
          guest_id: guest.id,
          employee_id: employee?.id || null,
          check_in_date: data.check_in_date.toLocaleDateString("sv-SE"),
          check_out_date: data.check_out_date.toLocaleDateString("sv-SE"),
          status: isCheckInMode ? "Active" : "Reserved",
          total_price: finalPriceInfo.total,
          paid_amount: data.paid_amount,
          payment_method_id: data.payment_method_id,
          has_extra_mattress: data.extra_mattress_count > 0,
          extra_mattress_price: data.extra_mattress_count * settings.mat,
          is_invoice_requested: data.is_invoice_requested,
          iva_amount: priceInfo.iva,
          origin_was_reservation: !isCheckInMode,
          iva_percentage: settings.iva,
          person_count: data.person_count,
          extra_mattress_count: data.extra_mattress_count,
          extra_mattress_unit_price: settings.mat,
          observation,
        },
        new_status_id,
        room_status_current_id,
        keyId: keyId,
        payment: {
          amount: data.paid_amount,
          payment_method_id: data.payment_method_id,
          employee_id: employee?.id || null,
          observation,
          payment_type: isCheckInMode
            ? PaymentType.PAGO_CHECKIN_DIRECTO
            : data.paid_amount >= finalPriceInfo.total
              ? PaymentType.PAGO_COMPLETO_RESERVA
              : PaymentType.ABONO_RESERVA,
          payment_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        price_overrides: {
          save: discountAmount > 0 && authorizedBy !== null,
          original_price: priceInfo.total,
          discount_amount: discountAmount,
          final_price: finalPriceInfo.total,
          authorized_by: authorizedBy?.id,
        },
        additionalGuestIds,
      });

      navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      showBlockUI("Ya estamos terminando...");
      setTimeout(() => {
        hideBlockUI();
      }, 1000);
    }

    hideBlockUI();
  };

  const verifyStay = async (data: any) => {
    const isApartmentAction = action === AccommodationTypeEnum.APARTAMENTO;
    if (isApartmentAction) {
      showBlockUI("Verificando disponibilidad...");
      const { data: currentConflicts } = await CheckAvailability(
        roomId,
        data.check_in_date.toLocaleDateString("sv-SE"),
        data.check_out_date.toLocaleDateString("sv-SE"),
      );
      hideBlockUI();

      if (currentConflicts && currentConflicts.length > 0) {
        setConflicts(currentConflicts);
        setIsConflictModalVisible(true);
        return false;
      }
    } else {
      const result = await checkAvailability.mutateAsync({
        roomId: roomId,
        checkInDate: data.check_in_date.toLocaleDateString("sv-SE"),
        checkOutDate: data.check_out_date.toLocaleDateString("sv-SE"),
      });

      if (!result.available && result.conflictingStays) {
        const formattedConflicts: Stay[] = FormattedConflicts(
          result.conflictingStays,
        );
        setConflicts(formattedConflicts);
        setIsConflictModalVisible(true);
        hideBlockUI();
        return false;
      }

      return true;
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
      <CheckInHeader
        title={isCheckInMode ? "Check-in" : "Nueva Reserva"}
        subtitle={accommodationTitleLabel}
        observation={accommodationObservationLabel}
        color={isCheckInMode ? "emerald-500" : "yellow-500"}
        onBack={() =>
          navigate(tabParam ? `/calendar?tab=${tabParam}` : "/calendar")
        }
      />

      <div className="pb-5">
        <StayDetailsForm
          title="Detalles de la Estadía"
          checkInDate={checkInDate}
          roomRates={roomRates}
          register={register}
          settings={settings}
          control={control}
          setValue={setValue}
          watch={watch}
          maxCapacity={10}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <AllGuestsForm
          searching={searching}
          searchGuest={searchGuest}
          guestNotFound={guestNotFound}
          guestFound={guestFound}
          searchMessage={searchMessage}
          watchDocNumber={watchDocNumber}
          personCount={personCount}
          selectedDepartment={selectedDepartment}
          colombiaData={colombiaData}
          cityOptions={cityOptions}
          register={register}
          control={control}
          setValue={setValue}
          watch={watch}
          findGuestByDoc={findGuestByDoc}
        />

        <CorporateClientSelector
          onOpenModal={() => setIsAdminModalVisible(true)}
          hasDiscount={discountAmount > 0}
          discountAmount={discountAmount}
          onResetDiscount={() => {
            setDiscountAmount(0);
            setAuthorizedBy(null);
          }}
        />

        <PaymentSection
          title="Pago"
          priceInfo={finalPriceInfo}
          nights={nights}
          personCount={personCount}
          extraMattressCount={extraMattressCount}
          settings={settings}
          paymentMethods={paymentMethods}
          control={control}
          setValue={setValue}
          watch={watch}
          isReservation={!isCheckInMode}
        />

        <AvailabilityConflictModal
          visible={isConflictModalVisible}
          onHide={() => setIsConflictModalVisible(false)}
          conflicts={conflicts}
        />

        <AdminAuthorizationModal
          visible={isAdminModalVisible}
          onHide={() => setIsAdminModalVisible(false)}
          currentTotal={priceInfo.total}
          onAuthorize={(admin, discount) => {
            setAuthorizedBy(admin);
            setDiscountAmount(discount);
            setValue("paid_amount", Math.max(0, priceInfo.total - discount));
          }}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            label={isCheckInMode ? "Confirmar Check-in" : "Confirmar Reserva"}
            className={`p-button text-white w-[250px] ${isCheckInMode ? "bg-emerald-500" : "bg-yellow-500"}`}
          />
        </div>
      </form>
    </div>
  );
};

export default CheckInPage;
