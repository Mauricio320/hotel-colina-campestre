import { useNode } from "@craftjs/core";
import React, { useState } from "react";
import { CardsProps } from "@/types";

const defaultProps: CardsProps = {
  columns: 3,
  gap: 24,
  cards: [
    {
      id: "1",
      icon: "pi pi-star",
      title: "Habitaciones de lujo",
      description: "Disfruta de nuestras cómodas y elegantes habitaciones diseñadas para tu descanso.",
    },
    {
      id: "2",
      icon: "pi pi-heart",
      title: "Servicio premium",
      description: "Atención personalizada 24/7 para hacer tu estadía inolvidable.",
    },
    {
      id: "3",
      icon: "pi pi-map-marker",
      title: "Ubicación privilegiada",
      description: "Rodeado de naturaleza, cerca de las principales atracciones turísticas.",
    },
  ],
};

const CardsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as CardsProps }));

  const [editingCard, setEditingCard] = useState<string | null>(null);

  const updateCard = (cardId: string, field: string, value: string) => {
    setProp((p: CardsProps) => {
      const updatedCards = p.cards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card
      );
      return { ...p, cards: updatedCards };
    });
  };

  const addCard = () => {
    setProp((p: CardsProps) => ({
      ...p,
      cards: [
        ...p.cards,
        {
          id: Date.now().toString(),
          icon: "pi pi-star",
          title: "Nueva tarjeta",
          description: "Descripción de la tarjeta",
        },
      ],
    }));
  };

  const removeCard = (cardId: string) => {
    setProp((p: CardsProps) => ({
      ...p,
      cards: p.cards.filter((card) => card.id !== cardId),
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Columnas</label>
        <select
          value={props.columns}
          onChange={(e) =>
            setProp((p: CardsProps) => ({ ...p, columns: parseInt(e.target.value) as CardsProps["columns"] }))
          }
          className="mt-1 w-full rounded border p-2 text-sm"
        >
          <option value={1}>1 columna</option>
          <option value={2}>2 columnas</option>
          <option value={3}>3 columnas</option>
          <option value={4}>4 columnas</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Espacio entre tarjetas (px)</label>
        <input
          type="range"
          min="8"
          max="64"
          value={props.gap}
          onChange={(e) => setProp((p: CardsProps) => ({ ...p, gap: parseInt(e.target.value) }))}
          className="mt-1 w-full"
        />
        <span className="text-xs text-gray-500">{props.gap}px</span>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Tarjetas</label>
          <button
            onClick={addCard}
            className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
          >
            + Agregar
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {props.cards.map((card) => (
            <div key={card.id} className="rounded border border-gray-200 p-3">
              {editingCard === card.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => updateCard(card.id, "icon", e.target.value)}
                    placeholder="Icono (ej: pi pi-star)"
                    className="w-full rounded border p-1 text-xs"
                  />
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(card.id, "title", e.target.value)}
                    placeholder="Título"
                    className="w-full rounded border p-1 text-xs"
                  />
                  <textarea
                    value={card.description}
                    onChange={(e) => updateCard(card.id, "description", e.target.value)}
                    placeholder="Descripción"
                    rows={2}
                    className="w-full rounded border p-1 text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCard(null)}
                      className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{card.title}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCard(card.id)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100"
                    >
                      <i className="pi pi-pencil text-xs" />
                    </button>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <i className="pi pi-trash text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Cards = (props: CardsProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  return (
    <div
      ref={(ref) => { connect(drag(ref)); }}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${mergedProps.columns}, 1fr)`,
        gap: `${mergedProps.gap}px`,
        width: "100%",
      }}
    >
      {mergedProps.cards.map((card) => (
        <div
          key={card.id}
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          {card.icon && (
            <div
              style={{
                width: "48px",
                height: "48px",
                margin: "0 auto 16px",
                backgroundColor: "#f0fdf4",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className={`${card.icon} text-xl text-emerald-600`} />
            </div>
          )}
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            {card.title}
          </h3>
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};

Cards.craft = {
  displayName: "Tarjetas",
  
  props: defaultProps,
  rules: {
    canDrag: true,
  },
  related: {
    settings: CardsSettings,
  },
};
