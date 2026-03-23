import { useEmployeesByRole } from "@/hooks/useEmployees";
import { Employee } from "@/types";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import React, { useMemo, useState } from "react";

interface AdminAuthorizationModalProps {
  visible: boolean;
  onHide: () => void;
  currentTotal: number;
  onAuthorize: (admin: Employee, invoiceAmount: number) => void;
}

const AdminAuthorizationModal: React.FC<AdminAuthorizationModalProps> = ({
  visible,
  onHide,
  currentTotal,
  onAuthorize,
}) => {
  const { data: adminList = [], isLoading: employeesLoading } = useEmployeesByRole("Admin");
  const [selectedAdmin, setSelectedAdmin] = useState<Employee | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const admins = useMemo(() => {
    return (
      adminList.map((admin) => ({
        ...admin,
        fullName: `${admin.first_name} ${admin.last_name}`,
      })) || []
    );
  }, [adminList]);


  const handleConfirm = async () => {
    if (!selectedAdmin) {
      setError("Seleccione un administrador");
      return;
    }

    if (invoiceAmount <= 0) {
      setError("Ingrese el valor de la factura");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      onAuthorize(selectedAdmin, invoiceAmount);
      onHide();
    } catch (err: any) {
      setError(err.message || "Error al validar la autorización");
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
        <i className="pi pi-file text-sm text-orange-600"></i>
      </div>
      <span className="font-bold text-gray-800">Autorización de Factura</span>
    </div>
  );

  return (
    <Dialog
      header={header}
      visible={visible}
      onHide={onHide}
      className="w-full max-w-md"
      draggable={false}
      resizable={false}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      <div className="flex flex-col gap-4">
        {error && <Message severity="error" text={error} className="w-full" />}

        <div className="rounded-xl bg-[#f5f2eb] p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                Administrador
              </label>
              <Dropdown
                value={selectedAdmin}
                options={admins}
                onChange={(e) => setSelectedAdmin(e.value)}
                optionLabel="fullName"
                placeholder="Seleccione"
                className="w-full"
                filter
                loading={employeesLoading}
              />
            </div>

            <div className="my-1 h-px bg-gray-300"></div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Valor Actual</span>
              <span className="font-bold text-gray-800">${currentTotal.toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                Valor de la Factura
              </label>
              <InputNumber
                value={invoiceAmount}
                onValueChange={(e) => setInvoiceAmount(Math.round(e.value || 0))}
                mode="currency"
                currency="COP"
                minFractionDigits={0}
                maxFractionDigits={0}
                className="w-full"
                inputClassName="w-full text-lg font-bold text-emerald-700"
                autoFocus
                min={0}
                placeholder="$0"
              />
            </div>

            <div className="my-1 h-px bg-gray-300"></div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Valor Final</span>
              <span className="text-xl font-black text-emerald-700">
                ${invoiceAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            unstyled
            label="Cancelar"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-outlined p-button-secondary flex-1"
          />
          <Button
            unstyled
            label="Confirmar"
            icon="pi pi-check"
            onClick={handleConfirm}
            className="p-button-warning flex-1"
            loading={loading}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default AdminAuthorizationModal;
