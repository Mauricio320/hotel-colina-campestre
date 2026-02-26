import { useNode } from "@craftjs/core";
import React, { useState } from "react";
import { NewsletterProps } from "@/types";

const defaultProps: NewsletterProps = {
  title: "Suscríbete a nuestro newsletter",
  description: "Recibe las últimas ofertas y noticias directamente en tu correo.",
  buttonText: "Suscribirse",
  successMessage: "¡Gracias por suscribirte!",
};

const NewsletterSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as NewsletterProps }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={props.title}
          onChange={(e) => setProp((p: NewsletterProps) => ({ ...p, title: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={props.description}
          onChange={(e) => setProp((p: NewsletterProps) => ({ ...p, description: e.target.value }))}
          rows={2}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Texto del botón</label>
        <input
          type="text"
          value={props.buttonText}
          onChange={(e) => setProp((p: NewsletterProps) => ({ ...p, buttonText: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Mensaje de éxito</label>
        <input
          type="text"
          value={props.successMessage}
          onChange={(e) => setProp((p: NewsletterProps) => ({ ...p, successMessage: e.target.value }))}
          className="mt-1 w-full rounded border p-2 text-sm"
        />
      </div>
    </div>
  );
};

export const Newsletter = (props: NewsletterProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // In a real implementation, this would subscribe the user
    }
  };

  if (submitted) {
    return (
      <div
        ref={(ref) => { connect(drag(ref)); }}
        style={{
          padding: "48px",
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
        padding: "48px",
        backgroundColor: "#059669",
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#ffffff", marginBottom: "8px" }}>
        {mergedProps.title}
      </h3>
      {mergedProps.description && (
        <p style={{ fontSize: "1.125rem", color: "#ffffff", opacity: 0.9, marginBottom: "24px" }}>
          {mergedProps.description}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          style={{
            flex: "1",
            minWidth: "250px",
            maxWidth: "400px",
            padding: "14px 20px",
            borderRadius: "8px",
            border: "none",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "14px 32px",
            backgroundColor: "#f59e0b",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {mergedProps.buttonText}
        </button>
      </form>
    </div>
  );
};

Newsletter.craft = {
  displayName: "Newsletter",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: NewsletterSettings,
  },
};
