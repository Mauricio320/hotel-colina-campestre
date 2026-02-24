import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Calendar } from "primereact/calendar";
import { Role } from "@/types";
import { supabase } from "@/config/supabase";
import { useAccommodationTypes } from "@/hooks/useAccommodationTypes";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

interface ReportsProps {
  userRole: string | null;
}

const Reports: React.FC<ReportsProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [invoiceStartDate, setInvoiceStartDate] = useState<Date | null>(null);
  const [invoiceEndDate, setInvoiceEndDate] = useState<Date | null>(null);
  const [occupancyStartDate, setOccupancyStartDate] = useState<Date | null>(null);
  const [occupancyEndDate, setOccupancyEndDate] = useState<Date | null>(null);
  const { fetchAll: accommodationTypesQuery } = useAccommodationTypes();

  if (userRole !== Role.Admin) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 font-bold text-red-700">
        Acceso denegado. Solo administradores.
      </div>
    );
  }

  const getPaymentStatus = (row: any) => {
    const pending = (row.total_price || 0) - (row.paid_amount || 0);
    if (pending > 0) {
      return {
        status: "Pendiente de Pago",
        severity: "warning",
      };
    } else {
      return {
        status: "Pago Completo",
        severity: "success",
      };
    }
  };

  const exportToExcel = (data: any[], fileName: string) => {
    if (!data.length) {
      alert("No hay datos para exportar");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    // Ajustar anchos de columna
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleRoomPaymentsReport = async () => {
    setLoading(true);
    try {
      const accommodationTypes = accommodationTypesQuery.data || [];

      if (accommodationTypes.length === 0) {
        alert("No se encontraron tipos de acomodación");
        setLoading(false);
        return;
      }

      // Validar fechas
      if (!startDate || !endDate) {
        alert("Por favor seleccione fecha de inicio y fecha de fin");
        setLoading(false);
        return;
      }

      const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");

      // Obtener todas las estancias con información relacionada filtradas por rango de fechas
      const { data: staysData, error: staysError } = await supabase
        .from("stays")
        .select(
          `
          id,
          order_number,
          check_in_date,
          check_out_date,
          total_price,
          paid_amount,
          status,
          origin_was_reservation,
          accommodation_type_id,
          guest:guests!stays_guest_id_fkey(first_name, last_name, doc_number),
          room:rooms(room_number, accommodation_type_id)
        `
        )
        .gte("check_in_date", formattedStartDate)
        .lte("check_in_date", formattedEndDate)
        .order("check_in_date", { ascending: false });

      if (staysError) throw staysError;

      if (!staysData || staysData.length === 0) {
        alert("No hay datos de pagos para exportar");
        setLoading(false);
        return;
      }

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear una hoja por cada tipo de acomodación
      for (const accType of accommodationTypes) {
        // Filtrar estancias por tipo de acomodación
        const typeStays = staysData.filter((stay: any) => {
          // Si tiene accommodation_type_id directo, usarlo
          if (stay.accommodation_type_id) {
            return stay.accommodation_type_id === accType.id;
          }
          // Si no, buscar en la habitación relacionada
          const roomAccTypeId = (stay.room as any)?.accommodation_type_id;
          return roomAccTypeId === accType.id;
        });

        // Formatear datos para la hoja (incluso si está vacía)
        const formattedData =
          typeStays.length > 0
            ? typeStays.map((stay: any) => {
                const paymentStatus = getPaymentStatus(stay);
                const pending = (stay.total_price || 0) - (stay.paid_amount || 0);

                return {
                  "N° Orden": stay.order_number,
                  Huésped: stay.guest ? `${stay.guest.first_name} ${stay.guest.last_name}` : "N/A",
                  Documento: stay.guest?.doc_number || "N/A",
                  "Fecha Check-in": stay.check_in_date,
                  "Fecha Check-out": stay.check_out_date,
                  Habitación: (stay.room as any)?.room_number || "N/A",
                  Origen: stay.origin_was_reservation ? "Reserva" : "Directo",
                  "Valor Total": stay.total_price || 0,
                  Abonado: stay.paid_amount || 0,
                  Pendiente: pending > 0 ? pending : 0,
                  "Estado Pago": paymentStatus.status,
                  "Estado Estadía": stay.status,
                };
              })
            : [];

        // Crear worksheet para este tipo de acomodación
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Ajustar anchos de columna
        const colWidths = [
          { wch: 12 }, // N° Orden
          { wch: 25 }, // Huésped
          { wch: 15 }, // Documento
          { wch: 15 }, // Fecha Check-in
          { wch: 15 }, // Fecha Check-out
          { wch: 12 }, // Habitación
          { wch: 12 }, // Origen
          { wch: 15 }, // Valor Total
          { wch: 15 }, // Abonado
          { wch: 15 }, // Pendiente
          { wch: 18 }, // Estado Pago
          { wch: 18 }, // Estado Estadía
        ];
        worksheet["!cols"] = colWidths;

        // Agregar hoja al workbook (nombre limitado a 31 caracteres)
        const sheetName = accType.name.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Verificar si se agregaron hojas
      if (workbook.SheetNames.length === 0) {
        alert("No hay datos de pagos para exportar");
        setLoading(false);
        return;
      }

      // Descargar archivo con fechas en el nombre
      const fileName = `reporte_pagos_habitaciones_${formattedStartDate}_a_${formattedEndDate}`;
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error generating room payments report:", error);
      alert("Error al generar el reporte de pagos");
    }
    setLoading(false);
  };

  const handleHistoryReport = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("room_history")
        .select(
          "timestamp, action_type, observation, room:rooms(room_number), employee:employees(first_name, last_name)"
        )
        .order("timestamp", { ascending: false });

      if (data) {
        const formatted = data.map((h) => ({
          Fecha: dayjs(h.timestamp).format("DD/MM/YYYY HH:mm"),
          Habitacion: (h.room as any)?.room_number,
          Accion: h.action_type,
          Encargado: h.employee
            ? `${(h.employee as any)?.first_name} ${(h.employee as any)?.last_name}`
            : "Sistema",
          Observacion: h.observation || "",
        }));
        exportToExcel(formatted, `historial_completo_${dayjs().format("YYYY-MM-DD")}`);
      }
    } catch (error) {
      console.error("Error generating history report:", error);
      alert("Error al generar el reporte histórico");
    }
    setLoading(false);
  };

  const handlePaymentsDetailReport = async () => {
    setLoading(true);
    try {
      const today = dayjs();
      const startDate = today.startOf("month");
      const endDate = today.endOf("month");

      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select(
          `
          payment_date,
          amount,
          payment_type,
          observation,
          payment_method:payment_methods(name),
          employee:employees(first_name, last_name),
          stay:stays(order_number, check_in_date, check_out_date),
          guest:guests!payments_guest_id_fkey(first_name, last_name, doc_number)
        `
        )
        .gte("payment_date", startDate.toISOString())
        .lte("payment_date", endDate.toISOString())
        .order("payment_date", { ascending: false });

      if (error) throw error;

      if (paymentsData && paymentsData.length > 0) {
        const formatted = paymentsData.map((p) => ({
          "Fecha Pago": dayjs(p.payment_date).format("DD/MM/YYYY HH:mm"),
          Monto: Number(p.amount),
          "Método Pago": (p.payment_method as any)?.name || "No especificado",
          "Tipo Pago":
            p.payment_type === "ABONO_RESERVA"
              ? "Abono Parcial"
              : p.payment_type === "PAGO_COMPLETO_RESERVA"
                ? "Pago Completo Reserva"
                : p.payment_type === "PAGO_CHECKIN_DIRECTO"
                  ? "Check-in Directo"
                  : p.payment_type === "ANTICIPADO_COMPLETO"
                    ? "Anticipado"
                    : p.payment_type,
          Orden: (p.stay as any)?.order_number,
          Huésped: (p.guest as any)
            ? `${(p.guest as any).first_name} ${(p.guest as any).last_name}`
            : "No especificado",
          Documento: (p.guest as any)?.doc_number || "N/A",
          "Check-in": (p.stay as any)?.check_in_date
            ? dayjs((p.stay as any).check_in_date).format("DD/MM/YYYY")
            : "",
          "Check-out": (p.stay as any)?.check_out_date
            ? dayjs((p.stay as any).check_out_date).format("DD/MM/YYYY")
            : "",
          "Registrado por": p.employee
            ? `${(p.employee as any).first_name} ${(p.employee as any).last_name}`
            : "Sistema",
          Observación: p.observation || "",
        }));
        exportToExcel(formatted, `reporte_pagos_detallado_${today.format("YYYY-MM")}`);
      } else {
        alert("No hay pagos registrados en el mes actual");
      }
    } catch (error) {
      console.error("Error generating payments report:", error);
      alert("Error al generar reporte de pagos");
    }
    setLoading(false);
  };

  const handlePaymentsInvoiceReport = async () => {
    setLoading(true);
    try {
      const accommodationTypes = accommodationTypesQuery.data || [];

      if (accommodationTypes.length === 0) {
        alert("No se encontraron tipos de acomodación");
        setLoading(false);
        return;
      }

      // Validar fechas
      if (!invoiceStartDate || !invoiceEndDate) {
        alert("Por favor seleccione fecha de inicio y fecha de fin");
        setLoading(false);
        return;
      }

      const formattedStartDate = dayjs(invoiceStartDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(invoiceEndDate).format("YYYY-MM-DD");

      // Obtener todos los pagos con información relacionada filtrados por rango de fechas
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          `
          id,
          payment_date,
          amount,
          payment_type,
          observation,
          stay_id,
          payment_method:payment_methods(name),
          employee:employees(first_name, last_name),
          stay:stays!inner(order_number, check_in_date, check_out_date, room:rooms(room_number, accommodation_type_id), guest:guests!stays_guest_id_fkey(first_name, last_name, doc_number))
        `
        )
        .gte("payment_date", formattedStartDate)
        .lte("payment_date", formattedEndDate)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      if (!paymentsData || paymentsData.length === 0) {
        alert("No hay datos de pagos para exportar en el rango de fechas seleccionado");
        setLoading(false);
        return;
      }

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear una hoja por cada tipo de acomodación
      for (const accType of accommodationTypes) {
        // Filtrar pagos por tipo de acomodación (a través de la habitación de la estadía)
        const typePayments = paymentsData.filter((payment: any) => {
          const roomAccTypeId = (payment.stay as any)?.room?.accommodation_type_id;
          return roomAccTypeId === accType.id;
        });

        // Formatear datos para la hoja (incluso si está vacía)
        const formattedData =
          typePayments.length > 0
            ? typePayments.map((payment: any) => {
                const getPaymentTypeDisplay = (type: string) => {
                  switch (type) {
                    case "ABONO_RESERVA":
                      return "Abono";
                    case "PAGO_COMPLETO_RESERVA":
                      return "Pago Completo";
                    case "PAGO_CHECKIN_DIRECTO":
                      return "Check-in Directo";
                    case "ANTICIPADO_COMPLETO":
                      return "Anticipado";
                    default:
                      return type;
                  }
                };

                return {
                  "N° Orden": (payment.stay as any)?.order_number,
                  Habitación: (payment.stay as any)?.room?.room_number || "N/A",
                  Huésped: (payment.stay as any)?.guest
                    ? `${(payment.stay as any).guest.first_name} ${(payment.stay as any).guest.last_name}`
                    : "N/A",
                  Documento: (payment.stay as any)?.guest?.doc_number || "N/A",
                  "Fecha Pago": dayjs(payment.payment_date).format("DD/MM/YYYY"),
                  Método: (payment.payment_method as any)?.name || "N/A",
                  Monto: Number(payment.amount),
                  "Tipo Pago": getPaymentTypeDisplay(payment.payment_type),
                  "Registrado por": payment.employee
                    ? `${(payment.employee as any).first_name} ${(payment.employee as any).last_name}`
                    : "Sistema",
                  Observación: payment.observation || "",
                };
              })
            : [];

        // Crear worksheet para este tipo de acomodación
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Ajustar anchos de columna
        const colWidths = [
          { wch: 12 }, // N° Orden
          { wch: 12 }, // Habitación
          { wch: 25 }, // Huésped
          { wch: 15 }, // Documento
          { wch: 12 }, // Fecha Pago
          { wch: 15 }, // Método
          { wch: 15 }, // Monto
          { wch: 18 }, // Tipo Pago
          { wch: 20 }, // Registrado por
          { wch: 25 }, // Observación
        ];
        worksheet["!cols"] = colWidths;

        // Agregar hoja al workbook (nombre limitado a 31 caracteres)
        const sheetName = accType.name.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Verificar si se agregaron hojas
      if (workbook.SheetNames.length === 0) {
        alert("No hay datos de pagos para exportar");
        setLoading(false);
        return;
      }

      // Descargar archivo con fechas en el nombre
      const fileName = `reporte_facturas_pagos_${formattedStartDate}_a_${formattedEndDate}`;
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error generating payments invoice report:", error);
      alert("Error al generar el reporte de facturas");
    }
    setLoading(false);
  };

  const handleOccupancyReport = async () => {
    setLoading(true);
    try {
      const accommodationTypes = accommodationTypesQuery.data || [];

      if (accommodationTypes.length === 0) {
        alert("No se encontraron tipos de acomodación");
        setLoading(false);
        return;
      }

      // Validar fechas
      if (!occupancyStartDate || !occupancyEndDate) {
        alert("Por favor seleccione fecha de inicio y fecha de fin");
        setLoading(false);
        return;
      }

      const formattedStartDate = dayjs(occupancyStartDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(occupancyEndDate).format("YYYY-MM-DD");

      // Obtener todas las estancias con información de habitación y huéspedes
      const { data: staysData, error: staysError } = await supabase
        .from("stays")
        .select(
          `
          id,
          check_in_date,
          check_out_date,
          room:rooms(room_number, accommodation_type_id),
          stay_guests(guest_id)
        `
        )
        .gte("check_in_date", formattedStartDate)
        .lte("check_in_date", formattedEndDate)
        .order("check_in_date", { ascending: false });

      if (staysError) throw staysError;

      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear una hoja por cada tipo de acomodación
      for (const accType of accommodationTypes) {
        // Filtrar estancias por tipo de acomodación
        const typeStays = (staysData || []).filter((stay: any) => {
          const roomAccTypeId = (stay.room as any)?.accommodation_type_id;
          return roomAccTypeId === accType.id;
        });

        // Agrupar por habitación
        const roomStats = new Map<
          string,
          {
            roomNumber: string;
            totalNights: number;
            totalGuests: number;
            totalStays: number;
          }
        >();

        for (const stay of typeStays) {
          const roomNumber = (stay.room as any)?.room_number || "N/A";
          const nights = dayjs(stay.check_out_date).diff(dayjs(stay.check_in_date), "day");
          const guestCount = (stay.stay_guests as any[])?.length || 1;

          if (roomStats.has(roomNumber)) {
            const existing = roomStats.get(roomNumber)!;
            existing.totalNights += nights;
            existing.totalGuests += guestCount;
            existing.totalStays += 1;
          } else {
            roomStats.set(roomNumber, {
              roomNumber,
              totalNights: nights,
              totalGuests: guestCount,
              totalStays: 1,
            });
          }
        }

        // Formatear datos para la hoja
        const formattedData = Array.from(roomStats.values()).map((stat) => ({
          Habitación: stat.roomNumber,
          "Total Noches": stat.totalNights,
          "Total Huéspedes": stat.totalGuests,
          "N° Estancias": stat.totalStays,
        }));

        // Crear worksheet para este tipo de acomodación
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Ajustar anchos de columna
        const colWidths = [
          { wch: 15 }, // Habitación
          { wch: 15 }, // Total Noches
          { wch: 18 }, // Total Huéspedes
          { wch: 15 }, // N° Estancias
        ];
        worksheet["!cols"] = colWidths;

        // Agregar hoja al workbook (nombre limitado a 31 caracteres)
        const sheetName = accType.name.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Verificar si se agregaron hojas con datos
      const hasData = workbook.SheetNames.some((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        return jsonData.length > 0;
      });

      if (!hasData) {
        alert("No hay datos de ocupación para exportar en el rango de fechas seleccionado");
        setLoading(false);
        return;
      }

      // Descargar archivo con fechas en el nombre
      const fileName = `reporte_ocupacion_habitaciones_${formattedStartDate}_a_${formattedEndDate}`;
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error generating occupancy report:", error);
      alert("Error al generar el reporte de ocupación");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 shadow-sm">
            <i className="pi pi-chart-bar text-xl"></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-800">Módulo de Reportes</h2>
        </div>
        {loading && <ProgressSpinner style={{ width: "30px", height: "30px" }} />}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Reporte Facturas Habitaciones"
          className="border-t-4 border-emerald-500 shadow-sm"
        >
          <p className="mb-4 text-gray-600">
            Genera un archivo Excel con una hoja por cada tipo de acomodación. Incluye información
            de huéspedes, montos, abonos y estado de pago.
          </p>
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Inicio</label>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha inicio"
                className="w-full"
                showIcon
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Fin</label>
              <Calendar
                value={endDate}
                onChange={(e) => setEndDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha fin"
                className="w-full"
                showIcon
              />
            </div>
          </div>
          <Button
            unstyled
            label="Descargar Excel de Pagos"
            icon="pi pi-file-excel"
            className="p-button-success w-full p-3 font-bold"
            onClick={handleRoomPaymentsReport}
            disabled={loading}
          />
        </Card>

        <Card
          title="Reporte de Facturas por Categoría"
          className="border-t-4 border-yellow-500 shadow-sm"
        >
          <p className="mb-4 text-gray-600">
            Genera un archivo Excel con una hoja por cada tipo de acomodación. Muestra los pagos
            registrados con método, tipo y empleado.
          </p>
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Inicio</label>
              <Calendar
                value={invoiceStartDate}
                onChange={(e) => setInvoiceStartDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha inicio"
                className="w-full"
                showIcon
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Fin</label>
              <Calendar
                value={invoiceEndDate}
                onChange={(e) => setInvoiceEndDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha fin"
                className="w-full"
                showIcon
              />
            </div>
          </div>
          <Button
            unstyled
            label="Descargar Excel de Facturas"
            icon="pi pi-file-pdf"
            className="p-button-warning w-full p-3 font-bold"
            onClick={handlePaymentsInvoiceReport}
            disabled={loading}
          />
        </Card>

        <Card
          title="Reporte de Ocupación por Habitación"
          className="border-t-4 border-purple-500 shadow-sm"
        >
          <p className="mb-4 text-gray-600">
            Genera un archivo Excel con una hoja por cada tipo de acomodación. Muestra el total de
            noches ocupadas y huéspedes por habitación.
          </p>
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Inicio</label>
              <Calendar
                value={occupancyStartDate}
                onChange={(e) => setOccupancyStartDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha inicio"
                className="w-full"
                showIcon
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Fecha Fin</label>
              <Calendar
                value={occupancyEndDate}
                onChange={(e) => setOccupancyEndDate(e.value as Date)}
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha fin"
                className="w-full"
                showIcon
              />
            </div>
          </div>
          <Button
            unstyled
            label="Descargar Excel de Ocupación"
            icon="pi pi-file-excel"
            className="p-button-help w-full bg-purple-500 p-3 font-bold text-white"
            onClick={handleOccupancyReport}
            disabled={loading}
          />
        </Card>
      </div>
    </div>
  );
};

export default Reports;
