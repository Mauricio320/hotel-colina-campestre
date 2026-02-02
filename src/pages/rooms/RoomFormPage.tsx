import { supabase } from "@/config/supabase";
import { CATEGORIES } from "@/constants";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useRooms } from "@/hooks/useRooms";
import { Room } from "@/types";
import { Button } from "primereact/button";
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
      const defaultStatusId = roomStatuses?.find(
        (s) => s.name === "Disponible",
      )?.id;

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-rounded p-button-secondary bg-white "
            onClick={handleBack}
            tooltip="Volver"
          />
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {isEditMode
                ? `Editar Habitación ${selectedRoom?.room_number || ""}`
                : "Nueva Habitación"}
            </h1>
            <p className="text-gray-500 font-medium">
              {isEditMode
                ? "Modifique los detalles de la habitación"
                : "Ingrese los datos para crear una nueva habitación"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-8">
          {/* Información General */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="pi pi-info-circle text-emerald-500"></i>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Número de Habitación
                </label>
                <InputText
                  {...register("room_number", { required: true })}
                  className={`w-full p-3 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.room_number ? "p-invalid" : ""}`}
                  placeholder="Ej: 101, Cabaña 1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Categoría
                </label>
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
                <label className="text-sm font-bold text-gray-700">
                  Camas Dobles
                </label>
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
                <label className="text-sm font-bold text-gray-700">
                  Camas Sencillas
                </label>
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
                      className="w-full p-3 h-[50px] rounded-xl border-gray-200 focus:border-emerald-500 min-h-[50px]"
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className="pi pi-money-bill text-emerald-500"></i>
                Configuración de Tarifas
              </h3>
              <Button
                type="button"
                label="Nueva Tarifa"
                className="bg-emerald-600 w-[150px] hover:bg-emerald-700 text-white border-none rounded-xl font-bold "
                onClick={() =>
                  append({ person_count: fields.length + 1, rate: 80000 })
                }
              />
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 bg-primary-h p-4 items-center border-b border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Personas
                </div>
                <div className="w-8"></div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Precio Noche (COP)
                </div>
                <div className="w-10"></div>
              </div>

              <div className="divide-y divide-gray-50 bg-white">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_auto_1fr_auto] gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <Controller
                        name={`rates.${index}.person_count`}
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
                        name={`rates.${index}.rate`}
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
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-text text-white p-button-rounded p-button-danger hover:bg-red-50 w-10 h-10"
                      onClick={() => remove(index)}
                      tooltip="Eliminar tarifa"
                    />
                  </div>
                ))}
              </div>
            </div>
            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-400 font-medium">
                No hay tarifas configuradas. Agregue al menos una.
              </div>
            )}
          </section>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              label="Guardar Cambios"
              icon="pi pi-check"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl px-8 py-3 font-bold transition-all hover:-translate-y-1"
              loading={upsertRoom.isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomFormPage;
