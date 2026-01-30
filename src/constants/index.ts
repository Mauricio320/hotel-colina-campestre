import React from "react";

export const CATEGORIES = ["Hotel", "Apartamento", "Casa 1", "Casa 2"] as const;

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Disponible: { label: "Disponible", color: "bg-emerald-500" },
  Ocupado: { label: "Ocupado", color: "bg-red-500" },
  Reservado: { label: "Reservado", color: "bg-yellow-500" },
  Limpieza: { label: "Limpieza", color: "bg-blue-500" },
  Mantenimiento: { label: "Mantenimiento", color: "bg-gray-500" },
};

export const DOC_TYPES = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
  "NIT",
];
