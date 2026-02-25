/**
 * 'LIMPIEZA', 'FIN-LIMPIEZA', 'MANTENIMIENTO', 'FIN-MANT'
 */
export enum RoomActionEnum {
  LIMPIEZA = "LIMPIEZA",
  FIN_LIMPIEZA = "FIN-LIMPIEZA",
  MANTENIMIENTO = "MANTENIMIENTO",
  FIN_MANT = "FIN-MANT",
}

export enum RoomStatusEnum {
  OCUPADO = "Ocupado",
  DISPONIBLE = "Disponible",
  RESERVED = "Reserved",
  RESERVADO = "Reservado",
  LIMPIEZA = "Limpieza",
  MANTENIMIENTO = "Mantenimiento",
}

export enum AccommodationTypeEnum {
  HABITACION = "Habitación",
  APARTAMENTO = "Apartamento",
}

export enum EmployeeRolesEnum {
  ADMINISTRADOR = "Admin",
  RECEPCIONISTA = "Recepcionista",
  ACOM = "Limpieza",
  MANTENIMIENTO = "Mantenimiento",
}

export enum RoomActionEnum {
  MANAGEMENT = "management",
  CHECK_IN = "check-in",
  BOOKING = "booking",
  OCCUPIED = "occupied",
}
