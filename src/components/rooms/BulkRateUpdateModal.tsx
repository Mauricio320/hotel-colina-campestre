import { CATEGORIES } from "@/constants";
import { useBlockUI } from "@/context/BlockUIContext";
import { useAuth } from "@/hooks/useAuth";
import { useBulkUpdateRoomRates } from "@/hooks/useBulkUpdateRoomRates";
import { useRoomRatesByCategory } from "@/hooks/useRoomRatesByCategory";
import { BulkRateUpdate, Room } from "@/types";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabPanel, TabView } from "primereact/tabview";
import React, { useEffect, useState } from "react";

interface BulkRateUpdateModalProps {
  visible: boolean;
  onHide: () => void;
}

interface RateConfig {
  person_count: number;
  current_rate: number;
  new_rate: number;
  affected_rooms_count: number;
}

const BulkRateUpdateModal: React.FC<BulkRateUpdateModalProps> = ({
  visible,
  onHide,
}) => {
  const { employee } = useAuth();
  const { showBlockUI, hideBlockUI } = useBlockUI();
  const [activeTab, setActiveTab] = useState(0);
  const [rateConfigs, setRateConfigs] = useState<RateConfig[]>([]);

  const category = CATEGORIES[activeTab];
  const { data: rooms, isLoading } = useRoomRatesByCategory(
    visible ? category : null
  );
  const bulkUpdate = useBulkUpdateRoomRates();

  // Calculate unique person counts and their rates when rooms data changes
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      setRateConfigs([]);
      return;
    }

    // Get all unique person counts across all rooms
    const personCountMap = new Map<number, { rate: number; rooms: Room[] }>();

    rooms.forEach((room) => {
      if (room.rates && room.rates.length > 0) {
        room.rates.forEach((rate) => {
          if (!personCountMap.has(rate.person_count)) {
            personCountMap.set(rate.person_count, { rate: rate.rate, rooms: [] });
          }
          personCountMap.get(rate.person_count)!.rooms.push(room);
        });
      }
    });

    // Convert to array and sort by person count
    const configs: RateConfig[] = Array.from(personCountMap.entries())
      .map(([person_count, data]) => ({
        person_count,
        current_rate: data.rate,
        new_rate: data.rate,
        affected_rooms_count: data.rooms.length,
      }))
      .sort((a, b) => a.person_count - b.person_count);

    setRateConfigs(configs);
  }, [rooms]);

  const handleRateChange = (personCount: number, newRate: number) => {
    setRateConfigs((prev) =>
      prev.map((config) =>
        config.person_count === personCount
          ? { ...config, new_rate: newRate }
          : config
      )
    );
  };

  const handleSave = async () => {
    if (!rooms || !employee) return;

    // Build updates array - only for rates that changed
    const updates: BulkRateUpdate[] = [];

    rateConfigs.forEach((config) => {
      if (config.new_rate !== config.current_rate) {
        // Find all rooms that have this person_count rate
        rooms.forEach((room) => {
          const rate = room.rates?.find(
            (r) => r.person_count === config.person_count
          );
          if (rate) {
            updates.push({
              room_id: room.id,
              person_count: config.person_count,
              old_rate: config.current_rate,
              new_rate: config.new_rate,
              rate_id: rate.id,
            });
          }
        });
      }
    });

    if (updates.length === 0) {
      onHide();
      return;
    }

    try {
      showBlockUI("Actualizando tarifas...");
      await bulkUpdate.mutateAsync({
        updates,
        employeeId: employee.id,
      });
      hideBlockUI();
      onHide();
    } catch (error) {
      hideBlockUI();
      console.error("Error updating rates:", error);
    }
  };

  const hasChanges = rateConfigs.some(
    (config) => config.new_rate !== config.current_rate
  );

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        disabled={bulkUpdate.isPending}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-lg font-semibold transition-colors"
      />
      <Button
        label="Guardar Cambios"
        icon="pi pi-check"
        onClick={handleSave}
        loading={bulkUpdate.isPending}
        disabled={!hasChanges}
        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all"
      />
    </div>
  );

  return (
    <Dialog
      header="Actualizar Tarifas Masivamente"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      footer={footer}
      className="rate-update-modal"
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Selecciona una categoría y modifica las tarifas. Solo se actualizarán
          las habitaciones que ya tengan configurada la tarifa para esa cantidad
          de personas.
        </p>

        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          {CATEGORIES.map((cat) => (
            <TabPanel key={cat} header={cat}>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <ProgressSpinner />
                </div>
              ) : rateConfigs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay tarifas configuradas para esta categoría.
                </div>
              ) : (
                <div className="space-y-4">
                  {rateConfigs.map((config) => (
                    <div
                      key={config.person_count}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">
                          {config.person_count}{" "}
                          {config.person_count === 1 ? "persona" : "personas"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Afecta {config.affected_rooms_count} habitacion
                          {config.affected_rooms_count !== 1 ? "es" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">Actual</span>
                          <span className="font-mono text-gray-600">
                            ${config.current_rate.toLocaleString()}
                          </span>
                        </div>

                        <i className="pi pi-arrow-right text-gray-400"></i>

                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Nueva</span>
                          <InputNumber
                            value={config.new_rate}
                            onValueChange={(e) =>
                              handleRateChange(config.person_count, e.value || 0)
                            }
                            mode="currency"
                            currency="COP"
                            locale="es-CO"
                            min={0}
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            className="w-32"
                            inputClassName={`font-mono ${
                              config.new_rate !== config.current_rate
                                ? "text-emerald-600 font-bold"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabPanel>
          ))}
        </TabView>

        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <i className="pi pi-exclamation-circle mr-2"></i>
            Se guardará un historial de todos los cambios realizados.
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BulkRateUpdateModal;
