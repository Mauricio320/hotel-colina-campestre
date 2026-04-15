import { supabase } from "@/config/supabase";
import { CATEGORIES } from "@/constants";
import { useBlockUI } from "@/context/BlockUIContext";
import { useDeleteRoomRate } from "@/hooks/useDeleteRoomRate";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useRooms } from "@/hooks/useRooms";
import { Room } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const RoomFormPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isEditMode = !!roomId;

  const { upsertRoom } = useRooms();
  const { data: roomStatuses } = useRoomStatuses();
  const deleteRoomRate = useDeleteRoomRate();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      room_number: "",
      category: tabParam || CATEGORIES[0],
      beds_double: 0,
      beds_single: 0,
      observation: "",
      rates: [{ person_count: 1, rate: 80000 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rates",
  });

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*, rates:room_rates(*)")
          .eq("id", roomId)
          .single();

        if (error) throw error;
        setSelectedRoom(data);

        // Reset form with room data
        reset({
          room_number: data.room_number,
          category: data.category,
          beds_double: data.beds_double,
          beds_single: data.beds_single,
          observation: data.observation || "",
          rates:
            data.rates && data.rates.length > 0
              ? data.rates.map((r: any) => ({
                  person_count: r.person_count,
                  rate: r.rate,
                }))
              : [{ person_count: 1, rate: 80000 }],
        });
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, reset]);

  const onSave = async (data: any) => {
    try {
      const defaultStatusId = roomStatuses?.find((s) => s.name === "Disponible")?.id;

      await upsertRoom.mutateAsync({
        room: {
          id: selectedRoom?.id,
          room_number: data.room_number,
          category: data.category,
          beds_double: data.beds_double,
          beds_single: data.beds_single,
          observation: data.observation,
          status_id: selectedRoom?.status_id || defaultStatusId,
        },
        rates: data.rates,
      });

      navigate(`/rooms?tab=${tabParam || data.category}`);
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    }
  };

  const handleBack = () => {
    navigate(`/rooms?tab=${tabParam || CATEGORIES[0]}`);
  };

  const confirmRemoveRate = (index: number, personCount: number) => {
    confirmDialog({
      message: `¿Está seguro que desea eliminar la tarifa para ${personCount} persona(s)?`,
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      acceptIcon: "pi pi-check",
      rejectIcon: "pi pi-times",
      acceptClassName: "p-button-danger",
      accept: async () => {
        // Si estamos editando una habitación existente, eliminar de Supabase primero
        if (selectedRoom?.id) {
          showBlockUI("Eliminando tarifa...");
          try {
            await deleteRoomRate.mutateAsync({
              roomId: selectedRoom.id,
              personCount,
            });
          } catch (error) {
            hideBlockUI();
            alert("Error al eliminar la tarifa de la base de datos");
            return;
          }
          hideBlockUI();
        }
        // Eliminar del formulario
        remove(index);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <ProgressSpinner />
      </div>
    );
  }

  const getPageTitle = () => {
    return isEditMode ? `Editar Habitación ${selectedRoom?.room_number || ""}` : "Nueva Habitación";
  };

  const getPageSubtitle = () => {
    return isEditMode
      ? "Modifique los detalles de la habitación"
      : "Ingrese los datos para crear una nueva habitación";
  };

  return (
    <div className="animate-fade-in mx-auto flex max-w-4xl flex-col gap-2 pb-12">
      <ConfirmDialog />
      <PageHeader
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        icon="pi-building"
        color="emerald"
        onBack={handleBack}
      />

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-8">
          {/* Información General */}
          <section>
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <i className="pi pi-info-circle text-emerald-500"></i>
              Información General
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Número de Habitación</label>
                <InputText
                  {...register("room_number", { required: true })}
                  className={`w-full rounded-xl border-gray-200 p-3 focus:border-emerald-500 focus:ring-emerald-500 ${errors.room_number ? "p-invalid" : ""}`}
                  placeholder="Ej: 101, Cabaña 1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Categoría</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={[...CATEGORIES]}
                      className="w-full rounded-xl border-gray-200"
                      placeholder="Seleccione una categoría"
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Camas Dobles</label>
                <Controller
                  name="beds_double"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      min={0}
                      showButtons
                      className="w-full"
                      inputClassName="w-full rounded-xl border-gray-200"
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Camas Sencillas</label>
                <Controller
                  name="beds_single"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      min={0}
                      showButtons
                      className="w-full"
                      inputClassName="w-full 3 rounded-xl border-gray-200"
                    />
                  )}
                />
              </div>
              <div className="col-span-full flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Descripción / Observaciones
                </label>
                <Controller
                  name="observation"
                  control={control}
                  render={({ field }) => (
                    <InputTextarea
                      {...field}
                      className="h-12.5 min-h-12.5 w-full rounded-xl border-gray-200 p-3 focus:border-emerald-500"
                      placeholder="Detalles de la habitación, equipamiento, etc."
                    />
                  )}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Configuración de Tarifas */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <i className="pi pi-money-bill text-emerald-500"></i>
                Configuración de Tarifas
              </h3>
              <Button
                unstyled
                type="button"
                label="Nueva Tarifa"
                className="w-37.5 rounded-xl border-none bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                onClick={() => append({ person_count: fields.length + 1, rate: 80000 })}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <div className="bg-primary-h grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 border-b border-gray-100 p-4">
                <div className="text-center text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Personas
                </div>
                <div className="w-8"></div>
                <div className="text-center text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Precio Noche (COP)
                </div>
                <div className="w-10"></div>
              </div>

              <div className="divide-y divide-gray-50 bg-white">
                {[...fields]
                  .sort((a, b) => a.person_count - b.person_count)
                  .map((field) => {
                    // Encontrar el índice real en el array original fields
                    const originalIndex = fields.findIndex((f) => f.id === field.id);
                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <Controller
                            name={`rates.${originalIndex}.person_count`}
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                value={field.value}
                                onValueChange={(e) => field.onChange(e.value)}
                                min={1}
                                showButtons
                                minFractionDigits={0}
                                maxFractionDigits={0}
                                className="w-full text-center"
                                inputClassName="text-center font-black text-emerald-600 border-none bg-transparent text-lg w-full"
                                placeholder="0"
                              />
                            )}
                          />
                        </div>

                        <i className="pi pi-arrow-right text-gray-300"></i>

                        <div className="flex justify-center">
                          <Controller
                            name={`rates.${originalIndex}.rate`}
                            control={control}
                            render={({ field }) => (
                              <InputNumber
                                value={field.value}
                                onValueChange={(e) => field.onChange(e.value)}
                                mode="currency"
                                currency="COP"
                                locale="es-CO"
                                minFractionDigits={0}
                                maxFractionDigits={0}
                                className="w-full text-center"
                                inputClassName="text-center font-black text-emerald-600 border-none bg-transparent text-lg w-full"
                                placeholder="0"
                              />
                            )}
                          />
                        </div>

                        <Button
                          unstyled
                          type="button"
                          icon="pi pi-trash"
                          disabled={fields.length === 1}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => {
                            const personCount = fields[originalIndex]?.person_count || 1;
                            confirmRemoveRate(originalIndex, personCount);
                          }}
                          tooltip={
                            fields.length === 1
                              ? "Debe mantener al menos una tarifa"
                              : "Eliminar tarifa"
                          }
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
            {fields.length === 0 && (
              <div className="py-8 text-center font-medium text-gray-400">
                No hay tarifas configuradas. Agregue al menos una.
              </div>
            )}
          </section>

          <div className="flex justify-end pt-4">
            <Button
              unstyled
              type="submit"
              label="Guardar Cambios"
              icon="pi pi-check"
              className="rounded-xl border-none bg-emerald-600 px-8 py-3 font-bold text-white transition-all hover:-translate-y-1 hover:bg-emerald-700"
              loading={upsertRoom.isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormPage;
