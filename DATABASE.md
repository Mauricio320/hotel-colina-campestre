# Database Schema - Hotel Colina Campestre

> **⚠️ WARNING:** This schema documentation is for reference only. It reflects the current Supabase database structure.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Tables](#core-tables)
   - [employees](#employees)
   - [guests](#guests)
   - [rooms](#rooms)
   - [stays](#stays)
3. [Catalog Tables](#catalog-tables)
   - [accommodation_types](#accommodation_types)
   - [room_statuses](#room_statuses)
   - [payment_methods](#payment_methods)
   - [roles](#roles)
4. [Transaction Tables](#transaction-tables)
   - [payments](#payments)
   - [stay_guests](#stay_guests)
   - [room_history](#room_history)
   - [room_rates](#room_rates)
5. [Relationships](#relationships)
6. [Enums & Types](#enums--types)

---

## Overview

This database supports a hotel management system with:
- Room inventory and status tracking
- Guest management
- Stay/Reservation management
- Payment processing
- Employee access control

---

## Core Tables

### employees

System users with authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| auth_id | uuid | FK → auth.users | Supabase Auth reference |
| doc_type | text | | Document type (CC, Passport, etc.) |
| doc_number | text | UNIQUE | Document number |
| first_name | text | NOT NULL | Employee first name |
| last_name | text | NOT NULL | Employee last name |
| phone | text | | Phone number |
| city | text | | City |
| address | text | | Address |
| email | text | NOT NULL, UNIQUE | Email address |
| role_id | uuid | FK → roles | Employee role |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

---

### guests

Hotel guests/clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| doc_type | text | NOT NULL | Document type |
| doc_number | text | NOT NULL, UNIQUE | Document number |
| first_name | text | NOT NULL | First name |
| last_name | text | NOT NULL | Last name |
| phone | text | | Phone number |
| city | text | | City |
| address | text | | Address |
| email | text | | Email address |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

---

### rooms

Physical rooms in the hotel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_number | text | NOT NULL, UNIQUE | Room number/identifier |
| category | text | | **LEGACY** - Room category (Hotel, Apartamento, Casa 1, Casa 2) |
| accommodation_type_id | uuid | FK → accommodation_types | **SOURCE OF TRUTH** - Room type |
| beds_double | int | DEFAULT 0 | Number of double beds |
| beds_single | int | DEFAULT 0 | Number of single beds |
| observation | text | | Room observations |
| status_id | uuid | FK → room_statuses | Current status |
| status_date | date | | Date when status is valid |
| is_active | boolean | DEFAULT true | Soft delete flag |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

> **Note:** `category` field is legacy. Use `accommodation_type_id` for new development.

---

### stays

Core transaction - represents a reservation or active stay.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| order_number | serial | UNIQUE | Auto-increment order number |
| room_id | uuid | FK → rooms | Assigned room |
| guest_id | uuid | FK → guests | Primary guest |
| employee_id | uuid | FK → employees | Employee who created the stay |
| accommodation_type_id | uuid | FK → accommodation_types | Type of accommodation |
| check_in_date | date | NOT NULL | Check-in date |
| check_out_date | date | NOT NULL | Check-out date |
| status | text | NOT NULL | Stay status: `Active`, `Completed`, `Cancelled`, `Reserved` |
| total_price | numeric(10,2) | NOT NULL | Total price for the stay |
| paid_amount | numeric(10,2) | DEFAULT 0 | Amount paid so far |
| payment_method_id | uuid | FK → payment_methods | Preferred payment method |
| has_extra_mattress | boolean | DEFAULT false | Has extra mattress |
| extra_mattress_price | numeric(10,2) | DEFAULT 0 | Price per extra mattress |
| extra_mattress_count | int | DEFAULT 0 | Number of extra mattresses |
| extra_mattress_unit_price | numeric(10,2) | DEFAULT 0 | Unit price for extra mattress |
| person_count | int | NOT NULL | Number of persons |
| iva_percentage | numeric(5,2) | DEFAULT 0 | IVA percentage |
| iva_amount | numeric(10,2) | DEFAULT 0 | Calculated IVA amount |
| is_invoice_requested | boolean | DEFAULT false | Invoice requested |
| observation | text | | General observations |
| origin_was_reservation | boolean | DEFAULT false | Originally was a reservation |
| active | boolean | DEFAULT true | Soft delete flag |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

---

## Catalog Tables

### accommodation_types

Types of accommodations available.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Type name |
| price | numeric(10,2) | NOT NULL | Base price |
| is_rentable | boolean | DEFAULT true | Can be rented |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

---

### room_statuses

Possible room statuses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Status name: `Disponible`, `Ocupado`, `Reservado`, `Limpieza`, `Mantenimiento` |
| color | text | | Color code for UI |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### payment_methods

Available payment methods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Method name (Efectivo, Tarjeta, Transferencia, etc.) |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### roles

Employee roles for access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Role name: `Admin`, `Recepcionista`, `Limpieza`, `Mantenimiento` |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

## Transaction Tables

### payments

Payment records for stays.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| stay_id | uuid | FK → stays | Related stay |
| payment_method_id | uuid | FK → payment_methods | Payment method used |
| employee_id | uuid | FK → employees | Employee who registered payment |
| accommodation_type_id | uuid | FK → accommodation_types | For categorization |
| amount | numeric(10,2) | NOT NULL | Payment amount |
| payment_date | timestamptz | NOT NULL | When payment was made |
| payment_type | text | NOT NULL | Type: `ABONO_RESERVA`, `PAGO_COMPLETO_RESERVA`, `PAGO_CHECKIN_DIRECTO`, `ANTICIPADO_COMPLETO` |
| observation | text | | Payment notes |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### stay_guests

Junction table for additional guests in a stay.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| stay_id | uuid | FK → stays | Stay reference |
| guest_id | uuid | FK → guests | Guest reference |
| is_primary_guest | boolean | DEFAULT false | Is the primary guest |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**PK:** (stay_id, guest_id)

---

### room_history

Audit log for room status changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | FK → rooms | Room affected |
| stay_id | uuid | FK → stays | Related stay (optional) |
| previous_status_id | uuid | FK → room_statuses | Previous status |
| new_status_id | uuid | FK → room_statuses | New status |
| employee_id | uuid | FK → employees | Who made the change |
| accommodation_type_id | uuid | FK → accommodation_types | Room type at time of change |
| action_type | text | NOT NULL | Type of action performed |
| observation | text | | Change notes |
| timestamp | timestamptz | DEFAULT now() | When change occurred |

---

### room_rates

Dynamic pricing based on person count per room.

---

### cleaning_logs

Registros de limpieza realizadas en las habitaciones (separado de room_history).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | FK → rooms | Habitación que fue limpiada |
| stay_id | uuid | FK → stays | Estancia asociada (optional) |
| employee_id | uuid | FK → employees | Empleado de limpieza que realizó el aseo |
| cleaning_type | text | NOT NULL | Tipo de limpieza: 'Aseo parcial' o 'Aseo general' |
| date | date | NOT NULL | Fecha en que se realizó la limpieza (puede venir por URL) |
| observation | text | | Observaciones adicionales sobre la limpieza |
| created_at | timestamptz | DEFAULT now() | When cleaning was registered |

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | FK → rooms | Room reference |
| person_count | int | NOT NULL | Number of persons this rate applies to |
| rate | numeric(10,2) | NOT NULL | Price for this person count |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | | Last update timestamp |

---

## Relationships

```
employees (role_id) → roles
guests → stays (guest_id)
rooms (accommodation_type_id) → accommodation_types
rooms (status_id) → room_statuses
stays (room_id) → rooms
stays (guest_id) → guests
stays (employee_id) → employees
stays (accommodation_type_id) → accommodation_types
stays (payment_method_id) → payment_methods
payments (stay_id) → stays
payments (payment_method_id) → payment_methods
payments (employee_id) → employees
payments (accommodation_type_id) → accommodation_types
stay_guests (stay_id) → stays
stay_guests (guest_id) → guests
room_history (room_id) → rooms
room_history (stay_id) → stays
room_history (previous_status_id, new_status_id) → room_statuses
room_history (employee_id) → employees
room_rates (room_id) → rooms
cleaning_logs (room_id) → rooms
cleaning_logs (stay_id) → stays
cleaning_logs (employee_id) → employees
```

---

## Enums & Types

### Stay Status
- `Active` - Currently staying
- `Completed` - Finished
- `Cancelled` - Cancelled
- `Reserved` - Reserved but not yet checked in

### Payment Types
- `ABONO_RESERVA` - Partial reservation payment
- `PAGO_COMPLETO_RESERVA` - Full reservation payment
- `PAGO_CHECKIN_DIRECTO` - Direct check-in payment
- `ANTICIPADO_COMPLETO` - Complete advance payment

### Room Status Names
- `Disponible` - Available
- `Ocupado` - Occupied
- `Reservado` - Reserved
- `Limpieza` - Cleaning
- `Mantenimiento` - Maintenance

---

## Important Notes

1. **Room Category Migration:** The `rooms.category` field is legacy. Always use `rooms.accommodation_type_id` for new development.

2. **Soft Deletes:** Tables use `is_active` or `active` flags for soft deletes rather than hard deletions.

3. **Audit Trail:** The `room_history` table tracks all room status changes for accountability.

4. **Pricing:** Room rates can be dynamic based on person count via `room_rates` table.

5. **Stay Lifecycle:**
   - Create with status `Reserved`
   - Convert to `Active` on check-in
   - Mark `Completed` on check-out
   - Or `Cancelled` if never realized
