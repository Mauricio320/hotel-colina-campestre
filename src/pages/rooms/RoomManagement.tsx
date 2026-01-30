import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { CATEGORIES, STATUS_MAP } from "@/constants";
import { Role, Room, RoomRate } from "@/types";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/config/supabase";

interface RoomManagementProps {
  userRole: string | null;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ userRole }) => {
  const { employee } = useAuth();
  const isAdmin = userRole === Role.Admin;
  const [activeTab, setActiveTab] = useState(0);
  const { roomsQuery, upsertRoom, updateStatus } = useRooms(
    CATEGORIES[activeTab],
  );

  const [showFormModal, setShowFormModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("room_statuses")
      .select("*")
      .then(({ data }) => setRoomStatuses(data || []));
  }, []);

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      room_number: "",
      category: CATEGORIES[activeTab],
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

  const openEdit = (room: Room) => {
    setSelectedRoom(room);
    reset({
      room_number: room.room_number,
      category: room.category,
      beds_double: room.beds_double,
      beds_single: room.beds_single,
      observation: room.observation || "",
      rates:
        room.rates && room.rates.length > 0
          ? room.rates.map((r) => ({
              person_count: r.person_count,
              rate: r.rate,
            }))
          : [{ person_count: 1, rate: 80000 }],
    });
    setShowFormModal(true);
  };

  const openCreate = () => {
    setSelectedRoom(null);
    reset({
      room_number: "",
      category: CATEGORIES[activeTab],
      beds_double: 0,
      beds_single: 0,
      observation: "",
      rates: [{ person_count: 1, rate: 80000 }],
    });
    setShowFormModal(true);
  };

  const openHistory = async (room: Room) => {
    setSelectedRoom(room);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    console.log("Prueba de loc");
    const { data } = await supabase
      .from("room_history")
      .select(
        "*, employee:employees(*), new_status:room_statuses!new_status_id(*), prev_status:room_statuses!previous_status_id(*)",
      )
      .eq("room_id", room.id)
      // .eq("stay.origin_was_reservation", true)
      .order("timestamp", { ascending: false });

    setHistory(data || []);
    setLoadingHistory(false);
  };

  const onQuickStatusChange = async (
    room: Room,
    statusName: string,
    action: string,
  ) => {
    const targetStatus = roomStatuses.find((s) => s.name === statusName);
    if (!targetStatus) return;

    try {
      await updateStatus.mutateAsync({
        roomId: room.id,
        statusId: targetStatus.id,
        actionType: action,
        employeeId: employee?.id,
        observation: `${action} desde el panel de gestión`,
      });
    } catch (e) {
      alert("Error: " + (e as any).message);
    }
  };

  const onSave = async (data: any) => {
    try {
      await upsertRoom.mutateAsync({
        room: {
          id: selectedRoom?.id,
          room_number: data.room_number,
          category: data.category,
          beds_double: data.beds_double,
          beds_single: data.beds_single,
          observation: data.observation,
          status_id:
            selectedRoom?.status_id ||
            roomStatuses.find((s) => s.name === "Disponible")?.id,
        },
        rates: data.rates,
      });
      setShowFormModal(false);
    } catch (e) {
      alert("Error al guardar: " + (e as any).message);
    }
  };

  const getStatusSeverity = (name: string) => {
    switch (name) {
      case "Disponible":
        return "success";
      case "Ocupado":
        return "danger";
      case "Reservado":
        return "warning";
      case "Limpieza":
        return "info";
      default:
        return "secondary";
    }
  };

  if (roomsQuery.isLoading)
    return (
      <div className="flex justify-center p-12">
        <ProgressSpinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Habitaciones
        </h2>
        {isAdmin && (
          <Button
            label="Nueva Habitación"
            icon="pi pi-plus"
            className="bg-emerald-600 shadow-md"
            onClick={openCreate}
          />
        )}
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {CATEGORIES.map((cat) => (
          <TabPanel key={cat} header={cat}>
            <div className="bg-white rounded-lg border shadow-sm mt-4 overflow-hidden">
              <DataTable
                value={roomsQuery.data || []}
                responsiveLayout="scroll"
                className="text-sm"
                paginator
                rows={10}
              >
                <Column
                  field="room_number"
                  header="No."
                  sortable
                  className="font-bold text-emerald-700"
                />
                <Column
                  header="Estado"
                  body={(rowData) => (
                    <Tag
                      value={rowData.status?.name}
                      severity={getStatusSeverity(rowData.status?.name)}
                    />
                  )}
                />
                <Column
                  header="Acciones Operativas"
                  body={(rowData) => (
                    <div className="flex gap-2">
                      {rowData.status?.name === "Disponible" && (
                        <>
                          <Button
                            icon="pi pi-star"
                            label="Limpiar"
                            className="p-button-text p-button-sm p-button-info"
                            onClick={() =>
                              onQuickStatusChange(
                                rowData,
                                "Limpieza",
                                "LIMPIEZA",
                              )
                            }
                          />
                          <Button
                            icon="pi pi-cog"
                            label="Mant."
                            className="p-button-text p-button-sm p-button-secondary"
                            onClick={() =>
                              onQuickStatusChange(
                                rowData,
                                "Mantenimiento",
                                "MANTENIMIENTO",
                              )
                            }
                          />
                        </>
                      )}
                      {rowData.status?.name === "Limpieza" && (
                        <Button
                          icon="pi pi-check"
                          label="Finalizar Limpieza"
                          className="p-button-sm p-button-info"
                          onClick={() =>
                            onQuickStatusChange(
                              rowData,
                              "Disponible",
                              "FIN-LIMPIEZA",
                            )
                          }
                        />
                      )}
                      {rowData.status?.name === "Mantenimiento" && (
                        <Button
                          icon="pi pi-check"
                          label="Finalizar Mant."
                          className="p-button-sm p-button-secondary"
                          onClick={() =>
                            onQuickStatusChange(
                              rowData,
                              "Disponible",
                              "FIN-MANT",
                            )
                          }
                        />
                      )}
                      {rowData.status?.name === "Ocupado" && (
                        <span className="text-xs italic text-gray-400">
                          En uso
                        </span>
                      )}
                    </div>
                  )}
                />
                <Column
                  header="Administración"
                  body={(rowData) => (
                    <div className="flex gap-1">
                      <Button
                        icon="pi pi-history"
                        className="p-button-text p-button-sm p-button-info"
                        tooltip="Ver Historial"
                        onClick={() => openHistory(rowData)}
                      />
                      {isAdmin && (
                        <Button
                          icon="pi pi-pencil"
                          className="p-button-text p-button-sm p-button-warning"
                          tooltip="Editar Tarifas y Datos"
                          onClick={() => openEdit(rowData)}
                        />
                      )}
                    </div>
                  )}
                />
              </DataTable>
            </div>
          </TabPanel>
        ))}
      </TabView>

      <Dialog
        header={
          selectedRoom
            ? `Editar Habitación ${selectedRoom.room_number}`
            : "Nueva Habitación"
        }
        visible={showFormModal}
        onHide={() => setShowFormModal(false)}
        className="w-full max-w-2xl"
      >
        <form
          onSubmit={handleSubmit(onSave)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold">Número de Habitación</label>
            <InputText
              {...register("room_number", { required: true })}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold">Categoría</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Dropdown {...field} options={CATEGORIES} className="w-full" />
              )}
            />
          </div>
          <div className="col-span-full border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-700">Tarifas por Huéspedes</h3>
              <Button
                type="button"
                icon="pi pi-plus"
                label="Añadir Tarifa"
                className="p-button-text p-button-sm"
                onClick={() =>
                  append({ person_count: fields.length + 1, rate: 80000 })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 bg-gray-50 p-2 rounded border"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] font-bold text-gray-400">
                      PARA PERSONAS
                    </label>
                    <Controller
                      name={`rates.${index}.person_count`}
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          value={field.value}
                          onValueChange={(e) => field.onChange(e.value)}
                          min={1}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] font-bold text-gray-400">
                      VALOR NOCHE (COP)
                    </label>
                    <Controller
                      name={`rates.${index}.rate`}
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          value={field.value}
                          onValueChange={(e) => field.onChange(e.value)}
                          mode="currency"
                          currency="COP"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="p-button-danger p-button-text p-button-rounded mt-4"
                    onClick={() => remove(index)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-6">
            <Button
              type="button"
              label="Cancelar"
              className="p-button-text"
              onClick={() => setShowFormModal(false)}
            />
            <Button
              type="submit"
              label="Guardar Habitación"
              icon="pi pi-save"
              className="bg-emerald-600"
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        header={`Historial: Habitación ${selectedRoom?.room_number}`}
        visible={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        className="w-full max-w-4xl"
      >
        {loadingHistory ? (
          <div className="flex justify-center p-8">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={history}
            responsiveLayout="scroll"
            className="text-xs"
            emptyMessage="No hay historial registrado para esta habitación."
          >
            <Column
              header="Fecha"
              body={(row) => new Date(row.timestamp).toLocaleString()}
              sortable
            />
            <Column
              header="Transición"
              body={(row) => (
                <div className="flex items-center gap-2">
                  <Tag
                    value={row.prev_status?.name || "N/A"}
                    severity={getStatusSeverity(row.prev_status?.name)}
                  />
                  <i className="pi pi-arrow-right text-[10px] text-gray-400"></i>
                  <Tag
                    value={row.new_status?.name}
                    severity={getStatusSeverity(row.new_status?.name)}
                  />
                </div>
              )}
            />
            <Column
              header="Responsable"
              body={(row) =>
                row.employee
                  ? `${row.employee.first_name} ${row.employee.last_name}`
                  : "SISTEMA"
              }
            />
            <Column field="observation" header="Notas" />
          </DataTable>
        )}
      </Dialog>
    </div>
  );
};

export default RoomManagement;
