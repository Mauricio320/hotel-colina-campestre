import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { supabase } from "@/config/supabase";
import { CATEGORIES } from "@/constants";
import { Payment } from "@/types";

const PaymentsInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch payments for the selected category
  const fetchPayments = async (category: string) => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        stay:stays(
          order_number,
          guest:guests(first_name, last_name),
          room:rooms!inner(room_number, category)
        ),
        payment_method:payment_methods(name),
        employee:employees(first_name, last_name)`
      )
      .eq("stay.room.category", category)
      .order("payment_date", { ascending: false });
    if (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
    return data || [];
  };

  // Effect to fetch payments whenever active tab changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const category = CATEGORIES[activeTab];
      const paymentsData = await fetchPayments(category);
      setAllPayments(paymentsData);
      setLoading(false);
    };
    load();
  }, [activeTab]);



  const getPaymentTypeDisplay = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "Abono";
      case "PAGO_COMPLETO_RESERVA":
        return "Pago Completo";
      case "PAGO_CHECKIN_DIRECTO":
        return "Check‑in Directo";
      case "ANTICIPADO_COMPLETO":
        return "Anticipado";
      default:
        return type;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "ABONO_RESERVA":
        return "bg-blue-50 text-blue-700";
      case "PAGO_COMPLETO_RESERVA":
        return "bg-green-50 text-green-700";
      case "PAGO_CHECKIN_DIRECTO":
        return "bg-emerald-50 text-emerald-700";
      case "ANTICIPADO_COMPLETO":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };



  const header = (
    <div className="flex flex-wrap gap-4 justify-between items-center p-2">
      <InputText
        type="search"
        onInput={(e: any) => setGlobalFilter(e.target.value)}
        placeholder="Buscar por orden, huésped, habitación, método o empleado..."
        className="p-inputtext-sm w-80"
      />
    </div>
  );

  return (
    <div className="p-4 animate-fade-in">
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {CATEGORIES.map((cat) => (
          <TabPanel key={cat} header={cat}>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <ProgressSpinner className="w-8 h-8" strokeWidth="4" />
              </div>
            ) : (
              <DataTable
                value={allPayments}
                header={header}
                globalFilter={globalFilter}
                responsiveLayout="stack"
                paginator
                rows={10}
                rowsPerPageOptions={[10, 20, 50]}
                emptyMessage={`No hay registros de pagos para la categoría ${cat}.`}
              >
                <Column
                  header="N° Orden"
                  body={(row) => (
                    <span className="font-black text-emerald-600">
                      #{row.stay?.order_number || "N/A"}
                    </span>
                  )}
                />
                <Column
                  header="Habitación"
                  body={(row) => (
                    <span className="font-bold text-emerald-600">
                      {row.stay?.room?.room_number || "N/A"}
                    </span>
                  )}
                />
                <Column
                  header="Huésped"
                  body={(row) => (
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
                        {row.stay?.guest 
                          ? `${row.stay.guest.first_name} ${row.stay.guest.last_name}`
                          : "N/A"}
                      </span>
                    </div>
                  )}
                />
                <Column
                  field="payment_date"
                  header="Fecha"
                  body={(row) => (
                    <span className="text-sm text-gray-600">
                      {new Date(row.payment_date).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  )}
                />
                <Column
                  header="Método"
                  body={(row) => (
                    <Tag
                      value={row.payment_method?.name || "N/A"}
                      severity="info"
                      className="text-xs font-bold uppercase"
                    />
                  )}
                />
                <Column
                  field="amount"
                  header="Monto"
                  body={(row) => (
                    <span className="font-black text-emerald-700">
                      $ {Number(row.amount).toLocaleString()}
                    </span>
                  )}
                />
                <Column
                  field="payment_type"
                  header="Tipo de Pago"
                  body={(row) => (
                    <Tag
                      value={getPaymentTypeDisplay(row.payment_type)}
                      className={`text-xs font-bold uppercase ${getPaymentTypeColor(row.payment_type)}`}
                    />
                  )}
                />
                <Column
                  header="Registrado por"
                  body={(row) => (
                    <span className="text-sm text-gray-600">
                      {row.employee 
                        ? `${row.employee.first_name} ${row.employee.last_name}`
                        : "N/A"}
                    </span>
                  )}
                />
                <Column
                  header="Acciones"
                  body={(row) => (
                    <Button
                      label="Ver Factura"
                      icon="pi pi-file-pdf"
                      className="p-button-text p-button-sm"
                      onClick={() => navigate(`/invoice/${row.stay_id}`)}
                    />
                  )}
                />
              </DataTable>
            )}
          </TabPanel>
        ))}
      </TabView>
    </div>
  );
};

export default PaymentsInvoice;
