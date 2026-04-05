/**
 * Landing Page Validation Schemas
 *
 * Zod schemas for validating landing page form data.
 */

import { z } from "zod";

// ============================================================================
// Shared Schemas
// ============================================================================

export const serviceItemSchema = z.object({
  id: z.string().uuid(),
  icon: z.string().min(1, "El ícono es requerido"),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
});

export const benefitItemSchema = z.object({
  id: z.string().uuid(),
  icon: z.string().min(1, "El ícono es requerido"),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres"),
});

export const attractionItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres"),
  image: z.string().url("Debe ser una URL válida"),
  distance_km: z.number().min(0, "La distancia debe ser positiva"),
});

export const photoItemSchema = z.object({
  id: z.string().uuid(),
  image_url: z.string().url("Debe ser una URL válida"),
  caption: z.string().max(100, "Máximo 100 caracteres").optional(),
  alt: z
    .string()
    .min(1, "El texto alternativo es requerido para accesibilidad")
    .max(100, "Máximo 100 caracteres"),
});

// ============================================================================
// Section Schemas
// ============================================================================

export const hotelContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
    subtitle: z.string().max(200, "Máximo 200 caracteres"),
    background_image: z.string().url("Debe ser una URL válida"),
    cta_text: z.string().max(30, "Máximo 30 caracteres").default("Reservar ahora"),
    cta_link: z.string().default("/reservar"),
  }),
  about: z.object({
    label: z.string().max(50, "Máximo 50 caracteres").default("Nuestra Esencia"),
    title: z.string().min(1, "El título es requerido").max(150, "Máximo 150 caracteres"),
    description_1: z
      .string()
      .min(1, "La descripción es requerida")
      .max(500, "Máximo 500 caracteres"),
    description_2: z.string().max(500, "Máximo 500 caracteres"),
    image_1: z.string().url("Debe ser una URL válida"),
    image_2: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  }),
  services: z.object({
    title: z.string().max(50, "Máximo 50 caracteres").default("Servicios Exclusivos"),
    items: z.array(serviceItemSchema).max(10, "Máximo 10 servicios"),
  }),
});

export const comfaboyContentSchema = z.object({
  hero: z.object({
    title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
    background_image: z.string().url("Debe ser una URL válida"),
  }),
  description: z.string().min(1, "La descripción es requerida").max(1000, "Máximo 1000 caracteres"),
  benefits: z.array(benefitItemSchema),
});

export const turismoContentSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  subtitle: z.string().max(200, "Máximo 200 caracteres"),
  attractions: z.array(attractionItemSchema).min(1, "Debe haber al menos una atracción"),
});

export const fotosContentSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  photos: z.array(photoItemSchema).min(1, "Debe haber al menos una foto"),
});

export const contactoContentSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres"),
  map_embed_url: z.string().url("Debe ser una URL válida").or(z.literal("")),
  contact_info: z.object({
    address: z.string().max(200, "Máximo 200 caracteres"),
    phone: z.string().max(50, "Máximo 50 caracteres"),
    email: z.string().email("Debe ser un email válido").max(100, "Máximo 100 caracteres"),
    hours: z.string().max(200, "Máximo 200 caracteres"),
  }),
  form_enabled: z.boolean().default(true),
});

// ============================================================================
// Type Exports
// ============================================================================

export type HotelFormSchema = z.infer<typeof hotelContentSchema>;
export type ComfaboyFormSchema = z.infer<typeof comfaboyContentSchema>;
export type TurismoFormSchema = z.infer<typeof turismoContentSchema>;
export type FotosFormSchema = z.infer<typeof fotosContentSchema>;
export type ContactoFormSchema = z.infer<typeof contactoContentSchema>;
