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

  const formatRates = (rates: RoomRate[]): string => {
    if (!rates || rates.length === 0) return "Sin tarifas";

    return rates
      .sort((a, b) => a.person_count - b.person_count)
      .map((rate) => `${rate.rate / 1000}k`)
      .join(" ∙ ");
  };

  const getRoomCapacity = (room: Room): string => {
    const total = room.beds_double * 2 + room.beds_single;
    const details = [];
    if (room.beds_double > 0) details.push(`${room.beds_double}D`);
    if (room.beds_single > 0) details.push(`${room.beds_single}S`);
    return `${total} pers. (${details.join("+")})`;
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <i className="pi pi-search text-gray-400"></i>
            <InputText
              placeholder="Buscar habitación..."
              className="border-0 bg-transparent w-40 focus:w-60 transition-all duration-200"
              onChange={(e) => {
                // TODO: Implementar búsqueda de habitaciones
              }}
            />
          </div>
          {isAdmin && (
            <Button
              label="Nueva Habitación"
              icon="pi pi-plus"
              className="bg-emerald-600 shadow-md"
              onClick={openCreate}
            />
          )}
        </div>
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {CATEGORIES.map((cat) => (
          <TabPanel key={cat} header={cat}>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <DataTable
                value={
                  roomsQuery.data?.sort((a, b) => {
                    // Orden lógico: primero numéricas, luego casas
                    const aNum = parseInt(a.room_number);
                    const bNum = parseInt(b.room_number);

                    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                    if (!isNaN(aNum) && isNaN(bNum)) return -1;
                    if (isNaN(aNum) && !isNaN(bNum)) return 1;

                    return a.room_number.localeCompare(b.room_number);
                  }) || []
                }
                responsiveLayout="scroll"
                className="text-sm"
                scrollable
                scrollHeight="600px"
                sortField="room_number"
                sortOrder={1}
              >
                <Column
                  field="room_number"
                  header="No."
                  sortable
                  className="font-bold text-emerald-700"
                  style={{ width: "80px" }}
                />
                <Column
                  header="Capacidad"
                  body={(rowData) => (
                    <div className="text-center font-medium text-blue-700">
                      {getRoomCapacity(rowData)}
                    </div>
                  )}
                />
                <Column
                  header="Descripción"
                  field="observation"
                  body={(rowData) => (
                    <div
                      className="text-xs text-gray-600 italic"
                      title={rowData.observation || "Sin descripción"}
                    >
                      {rowData.observation ? (
                        rowData.observation.length > 30 ? (
                          `${rowData.observation.substring(0, 30)}...`
                        ) : (
                          rowData.observation
                        )
                      ) : (
                        <span className="text-gray-400">Sin descripción</span>
                      )}
                    </div>
                  )}
                />
                <Column
                  header="Tarifas"
                  body={(rowData) => (
                    <div className="font-mono text-sm text-emerald-700 font-semibold text-center">
                      {formatRates(rowData.rates || [])}
                    </div>
                  )}
                />
                <Column
                  header="Administración"
                  body={(rowData) => (
                    <div className="flex gap-1 justify-center">
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
                          tooltip="Editar Tarifas"
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
          selectedRoom ? (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg">
                <i className="pi pi-home mr-2"></i>
                {selectedRoom.room_number}
              </div>
              <div className="text-gray-600">Editar Tarifas</div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                <i className="pi pi-plus mr-2"></i>
                Nueva Habitación
              </div>
            </div>
          )
        }
        visible={showFormModal}
        onHide={() => setShowFormModal(false)}
        className="w-full max-w-3xl"
        contentClassName="bg-gradient-to-br from-gray-50 to-white"
        headerClassName="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-none rounded-t-lg"
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
                <Dropdown
                  {...field}
                  options={[...CATEGORIES]}
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="col-span-full border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <i className="pi pi-money-bill text-emerald-600"></i>
                  <span className="text-lg">Configuración de Tarifas</span>
                </h3>
                <Button
                  type="button"
                  icon="pi pi-plus-circle"
                  label="Añadir Tarifa"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md"
                  onClick={() =>
                    append({ person_count: fields.length + 1, rate: 80000 })
                  }
                />
              </div>
              {fields.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <i className="pi pi-eye text-emerald-600"></i>
                    <span className="font-semibold">
                      Vista previa de tarifas:
                    </span>
                    <span className="font-mono bg-emerald-50 px-3 py-1 rounded text-emerald-800 font-semibold">
                      {fields
                        .map((_, index) => {
                          const rateField = control._formValues.rates?.[index];
                          return rateField
                            ? `${rateField.rate / 1000}k`
                            : "---k";
                        })
                        .join(" ∙ ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <i className="pi pi-users text-blue-600"></i>
                      <span>Personas</span>
                    </label>
                    <Controller
                      name={`rates.${index}.person_count`}
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          value={field.value}
                          onValueChange={(e) => field.onChange(e.value)}
                          min={1}
                          className="w-full border-gray-300 hover:border-blue-400 focus:border-blue-500"
                          placeholder="1"
                          minFractionDigits={0}
                          maxFractionDigits={0}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-center text-gray-400 font-bold">
                    <i className="pi pi-arrow-right text-2xl"></i>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <i className="pi pi-money-bill text-green-600"></i>
                      <span>Valor noche</span>
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
                          className="w-full border-gray-300 hover:border-green-400 focus:border-green-500"
                          minFractionDigits={0}
                          maxFractionDigits={0}
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-danger p-button-text p-button-rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => remove(index)}
                      tooltip="Eliminar tarifa"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-full flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times-circle"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
              onClick={() => setShowFormModal(false)}
            />
            <Button
              type="submit"
              label="Guardar Cambios"
              icon="pi pi-check-circle"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
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
