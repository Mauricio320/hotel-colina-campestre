import React, { useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { createClient } from "@supabase/supabase-js";
import { useEmployeesByRole } from "@/hooks/useEmployees";
import { Employee } from "@/types";

interface AdminAuthorizationModalProps {
  visible: boolean;
  onHide: () => void;
  currentTotal: number;
  onAuthorize: (admin: Employee, discountAmount: number) => void;
}

const AdminAuthorizationModal: React.FC<AdminAuthorizationModalProps> = ({
  visible,
  onHide,
  currentTotal,
  onAuthorize,
}) => {
  const { data: adminList = [], isLoading: employeesLoading } =
    useEmployeesByRole("Admin");
  const [selectedAdmin, setSelectedAdmin] = useState<Employee | null>(null);
  const [password, setPassword] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
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

  const finalTotal = useMemo(() => {
    return Math.max(0, currentTotal - (discountAmount || 0));
  }, [currentTotal, discountAmount]);

  const handleConfirm = async () => {
    if (!selectedAdmin) {
      setError("Seleccione un administrador");
      return;
    }
    if (!password) {
      setError("Ingrese la contraseña");
      return;
    }
    if (discountAmount <= 0) {
      setError("El valor del descuento debe ser mayor a 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      const { error: authError } = await tempClient.auth.signInWithPassword({
        email: selectedAdmin.email,
        password: password,
      });

      if (authError) {
        throw new Error("Contraseña incorrecta o error de autorización");
      }

      onAuthorize(selectedAdmin, discountAmount);
      onHide();
    } catch (err: any) {
      setError(err.message || "Error al validar la autorización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Autorización de Descuento (Cliente Empresarial)"
      visible={visible}
      onHide={onHide}
      className="w-full max-w-md"
      draggable={false}
      resizable={false}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
    >
      <div className="flex flex-col gap-4">
        {error && <Message severity="error" text={error} className="w-full" />}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600">
            Administrador
          </label>
          <Dropdown
            value={selectedAdmin}
            options={admins}
            onChange={(e) => setSelectedAdmin(e.value)}
            optionLabel="fullName"
            placeholder="Seleccione un administrador"
            className="w-full"
            filter
            loading={employeesLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600">
            Contraseña de Administrador
          </label>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={false}
            className="w-full"
            inputClassName="w-full"
            placeholder="Ingrese contraseña"
          />
        </div>

        <div className="bg-gray-100 h-1 w-full my-2"></div>

        <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Valor Actual:</span>
            <span className="font-bold text-gray-800">
              {currentTotal.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Valor del Descuento
            </label>
            <InputNumber
              value={discountAmount}
              onValueChange={(e) => setDiscountAmount(Math.round(e.value || 0))}
              mode="decimal"
              prefix="$ "
              useGrouping={true}
              minFractionDigits={0}
              maxFractionDigits={0}
              className="w-full"
              inputClassName="w-full text-xl font-bold text-red-600"
              autoFocus
              min={0}
              max={currentTotal}
            />
          </div>

          <Divider className="my-1" />

          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-bold">Total Final:</span>
            <span className="text-2xl font-black text-green-600">
              {finalTotal.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            label="Confirmar Descuento"
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
