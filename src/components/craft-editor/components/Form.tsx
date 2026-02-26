import { useNode } from "@craftjs/core";
import React, { useState } from "react";
import { FormProps } from "@/types";

const defaultProps: FormProps = {
  title: "Contáctanos",
  fields: [
    {
      id: "1",
      type: "text",
      label: "Nombre completo",
      required: true,
      placeholder: "Ingresa tu nombre",
    },
    {
      id: "2",
      type: "email",
      label: "Correo electrónico",
      required: true,
      placeholder: "tu@email.com",
    },
    {
      id: "3",
      type: "tel",
      label: "Teléfono",
      required: false,
      placeholder: "+57 300 000 0000",
    },
  ],
  submitText: "Enviar mensaje",
  successMessage: "¡Gracias! Tu mensaje ha sido enviado.",
  recipientEmail: "info@hotelcolinacampestre.com",
};

const FormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FormProps }));

  const [newFieldType, setNewFieldType] = useState<FormProps["fields"][0]["type"]>("text");

  const addField = () => {
    setProp((p: FormProps) => ({
      ...p,
      fields: [
        ...p.fields,
        {
          id: Date.now().toString(),
          type: newFieldType,
          label: "Nuevo campo",
          required: false,
          placeholder: "",
        },
      ],
    }));
  };

  const removeField = (fieldId: string) => {
    setProp((p: FormProps) => ({
      ...p,
      fields: p.fields.filter((f) => f.id !== fieldId),
    }));
  };

  const updateField = (fieldId: string, field: keyof FormProps["fields"][0], value: string | boolean) => {
    setProp((p: FormProps) => ({
      ...p,
      fields: p.fields.map((f) => (f.id === fieldId ? { ...f, [field]: value } : f)),
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Título del formulario</label>
        <input
          type="text"
          value={props.title}
          onChange={(e) => setProp((p: FormProps) => ({ ...p, title: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Texto del botón</label>
        <input
          type="text"
          value={props.submitText}
          onChange={(e) => setProp((p: FormProps) => ({ ...p, submitText: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Mensaje de éxito</label>
        <input
          type="text"
          value={props.successMessage}
          onChange={(e) => setProp((p: FormProps) => ({ ...p, successMessage: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Email destinatario</label>
        <input
          type="email"
          value={props.recipientEmail}
          onChange={(e) => setProp((p: FormProps) => ({ ...p, recipientEmail: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Campos</label>
          <div className="flex gap-2">
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value as FormProps["fields"][0]["type"])}
              className="rounded border p-1 text-xs"
            >
              <option value="text">Texto</option>
              <option value="email">Email</option>
              <option value="tel">Teléfono</option>
              <option value="textarea">Área de texto</option>
            </select>
            <button
              onClick={addField}
              className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              + Agregar
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {props.fields.map((field) => (
            <div key={field.id} className="rounded border border-gray-200 p-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, "label", e.target.value)}
                  placeholder="Etiqueta"
                  className="flex-1 rounded border p-1 text-xs"
                />
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, "type", e.target.value)}
                  className="w-24 rounded border p-1 text-xs"
                >
                  <option value="text">Texto</option>
                  <option value="email">Email</option>
                  <option value="tel">Tel</option>
                  <option value="textarea">Textarea</option>
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, "required", e.target.checked)}
                  />
                  Req.
                </label>
                <button
                  onClick={() => removeField(field.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <i className="pi pi-trash text-xs" />
                </button>
              </div>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                placeholder="Placeholder"
                className="mt-1 w-full rounded border p-1 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Form = (props: FormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real implementation, this would send the form data
  };

  if (submitted) {
    return (
      <div
        ref={(ref) => { connect(drag(ref)); }}
        style={{
          padding: "32px",
          backgroundColor: "#f0fdf4",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <i className="pi pi-check-circle text-4xl text-emerald-600" />
        <p style={{ marginTop: "16px", color: "#065f46", fontSize: "1.125rem" }}>
          {mergedProps.successMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={(ref) => { connect(drag(ref)); }}
      style={{
        padding: "32px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {mergedProps.title && (
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
          {mergedProps.title}
        </h3>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {mergedProps.fields.map((field) => (
          <div key={field.id}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              {field.label}
              {field.required && <span style={{ color: "#ef4444" }}> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                }}
              />
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                }}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          style={{
            padding: "14px 24px",
            backgroundColor: "#f59e0b",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          {mergedProps.submitText}
        </button>
      </form>
    </div>
  );
};

Form.craft = {
  displayName: "Formulario",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: FormSettings,
  },
};
