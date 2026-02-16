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
   - [maintenance_categories](#maintenance_categories)
   - [maintenance_subcategories](#maintenance_subcategories)
   - [settings](#settings)
4. [Transaction Tables](#transaction-tables)
   - [payments](#payments)
   - [stay_guests](#stay_guests)
   - [room_history](#room_history)
   - [room_rates](#room_rates)
   - [cleaning_logs](#cleaning_logs)
   - [maintenance_logs](#maintenance_logs)
   - [price_overrides](#price_overrides)
   - [accommodation_type_price_history](#accommodation_type_price_history)
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
- Maintenance and cleaning logs
- Price history tracking

---

## Core Tables

### employees

System users with authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| auth_id | uuid | FK → auth.users, UNIQUE | Supabase Auth reference |
| doc_type | text | DEFAULT 'Cédula de Ciudadanía' | Document type (CC, Passport, etc.) |
| doc_number | text | UNIQUE | Document number |
| first_name | text | NOT NULL | Employee first name |
| last_name | text | NOT NULL | Employee last name |
| phone | text | | Phone number |
| city | text | | City |
| address | text | | Address |
| email | text | NOT NULL | Email address |
| role_id | uuid | FK → roles | Employee role |
| active | boolean | NOT NULL DEFAULT true | Soft delete flag |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

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

---

### rooms

Physical rooms in the hotel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_number | text | NOT NULL | Room number/identifier |
| category | text | CHECK (Hotel, Apartamento, Casa 1, Casa 2) | **LEGACY** - Room category |
| accommodation_type_id | uuid | FK → accommodation_types | **SOURCE OF TRUTH** - Room type |
| beds_double | int | DEFAULT 0 | Number of double beds |
| beds_single | int | DEFAULT 0 | Number of single beds |
| observation | text | | Room observations |
| status_id | uuid | FK → room_statuses | Current status |
| status_date | date | DEFAULT CURRENT_DATE | Date when status is valid |
| is_active | boolean | DEFAULT true | Soft delete flag |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

> **Note:** `category` field is legacy. Use `accommodation_type_id` for new development.

---

### stays

Core transaction - represents a reservation or active stay.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| order_number | serial | NOT NULL, UNIQUE | Auto-increment order number |
| room_id | uuid | FK → rooms | Assigned room |
| guest_id | uuid | FK → guests | Primary guest |
| employee_id | uuid | FK → employees | Employee who created the stay |
| accommodation_type_id | uuid | FK → accommodation_types | Type of accommodation |
| room_status_id | uuid | FK → room_statuses | Room status at time of stay |
| check_in_date | date | NOT NULL | Check-in date |
| check_out_date | date | NOT NULL | Check-out date |
| status | text | NOT NULL CHECK (Active, Reserved, Completed, Cancelled, Moved) | Stay status |
| total_price | numeric | NOT NULL | Total price for the stay |
| paid_amount | numeric | DEFAULT 0 | Amount paid so far |
| payment_method_id | uuid | FK → payment_methods | Preferred payment method |
| has_extra_mattress | boolean | DEFAULT false | Has extra mattress |
| extra_mattress_price | numeric | DEFAULT 0 | Price per extra mattress |
| extra_mattress_count | int | DEFAULT 0 | Number of extra mattresses |
| extra_mattress_unit_price | int | DEFAULT 0 | Unit price for extra mattress |
| person_count | int | DEFAULT 1 | Number of persons |
| iva_percentage | int | DEFAULT 19 | IVA percentage |
| iva_amount | numeric | DEFAULT 0 | Calculated IVA amount |
| is_invoice_requested | boolean | DEFAULT false | Invoice requested |
| custom_rate_applied | boolean | DEFAULT false | Custom rate was applied |
| origin_was_reservation | boolean | DEFAULT false | Originally was a reservation |
| active | boolean | DEFAULT true | Soft delete flag |
| cancelled | boolean | DEFAULT false | Stay was cancelled |
| observation | text | | General observations |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

## Catalog Tables

### accommodation_types

Types of accommodations available.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL | Type name |
| price | numeric | NOT NULL | Base price |
| is_rentable | boolean | NOT NULL DEFAULT true | Can be rented |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### room_statuses

Possible room statuses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Status name: `Disponible`, `Ocupado`, `Reservado`, `Limpieza`, `Mantenimiento` |
| color | text | NOT NULL | Color code for UI |

---

### payment_methods

Available payment methods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Method name (Efectivo, Tarjeta, Transferencia, etc.) |

---

### roles

Employee roles for access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Role name: `Admin`, `Recepcionista`, `Limpieza`, `Mantenimiento` |

---

### maintenance_categories

Categories for maintenance tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | text | NOT NULL, UNIQUE | Category name |
| icon | text | | Icon identifier for UI |
| color | text | | Color code for UI |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### maintenance_subcategories

Subcategories for maintenance tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| category_id | uuid | NOT NULL, FK → maintenance_categories | Parent category |
| name | text | NOT NULL | Subcategory name |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### settings

System configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| key | text | NOT NULL, UNIQUE | Setting key/name |
| value | numeric | NOT NULL | Setting value |

---

## Transaction Tables

### payments

Payment records for stays.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| stay_id | uuid | NOT NULL, FK → stays | Related stay |
| payment_method_id | uuid | NOT NULL, FK → payment_methods | Payment method used |
| employee_id | uuid | NOT NULL, FK → employees | Employee who registered payment |
| amount | numeric | NOT NULL | Payment amount |
| payment_type | text | NOT NULL CHECK (ABONO_RESERVA, PAGO_COMPLETO_RESERVA, PAGO_CHECKIN_DIRECTO, ANTICIPADO_COMPLETO) | Type of payment |
| observation | text | | Payment notes |
| payment_date | timestamptz | DEFAULT now() | When payment was made |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### stay_guests

Junction table for additional guests in a stay.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| stay_id | uuid | NOT NULL, FK → stays | Stay reference |
| guest_id | uuid | NOT NULL, FK → guests | Guest reference |
| is_primary_guest | boolean | DEFAULT false | Is the primary guest |
| created_at | timestamp | DEFAULT now() | Creation timestamp |

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

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | FK → rooms | Room reference |
| person_count | int | NOT NULL | Number of persons this rate applies to |
| rate | numeric | NOT NULL | Price for this person count |

---

### cleaning_logs

Cleaning records for rooms (separate from room_history).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | NOT NULL, FK → rooms | Room that was cleaned |
| stay_id | uuid | FK → stays | Related stay (optional) |
| employee_id | uuid | NOT NULL, FK → employees | Cleaning employee who performed the task |
| cleaning_type | text | NOT NULL CHECK ('Aseo parcial', 'Aseo general') | Type of cleaning |
| date | date | NOT NULL DEFAULT CURRENT_DATE | Date when cleaning was performed |
| observation | text | | Additional observations about the cleaning |
| created_at | timestamptz | DEFAULT now() | When cleaning was registered |

---

### maintenance_logs

Maintenance records for rooms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| room_id | uuid | NOT NULL, FK → rooms | Room affected |
| stay_id | uuid | FK → stays | Related stay (optional) |
| employee_id | uuid | NOT NULL, FK → employees | Employee who registered the maintenance |
| category_id | uuid | NOT NULL, FK → maintenance_categories | Maintenance category |
| subcategory_id | uuid | NOT NULL, FK → maintenance_subcategories | Maintenance subcategory |
| observation | text | | Additional observations |
| date | date | NOT NULL DEFAULT CURRENT_DATE | Date of maintenance |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### price_overrides

Price overrides/discounts for stays.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| stay_id | uuid | NOT NULL, FK → stays | Related stay |
| original_price | numeric | NOT NULL | Original price before override |
| discount_amount | numeric | NOT NULL DEFAULT 0 | Discount amount applied |
| final_price | numeric | NOT NULL | Final price after override |
| authorized_by | uuid | NOT NULL, FK → employees | Employee who authorized the override |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

---

### accommodation_type_price_history

History of price changes for accommodation types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| accommodation_type_id | uuid | NOT NULL, FK → accommodation_types | Type of accommodation |
| employee_id | uuid | NOT NULL | Employee who made the price change |
| price | numeric | NOT NULL | New price value |
| created_at | timestamptz | DEFAULT now() | When the change was made |

---

## Relationships

```
employees (role_id) → roles
employees (auth_id) → auth.users
guests → stays (guest_id)
rooms (accommodation_type_id) → accommodation_types
rooms (status_id) → room_statuses
stays (room_id) → rooms
stays (guest_id) → guests
stays (employee_id) → employees
stays (accommodation_type_id) → accommodation_types
stays (payment_method_id) → payment_methods
stays (room_status_id) → room_statuses
payments (stay_id) → stays
payments (payment_method_id) → payment_methods
payments (employee_id) → employees
stay_guests (stay_id) → stays
stay_guests (guest_id) → guests
room_history (room_id) → rooms
room_history (stay_id) → stays
room_history (previous_status_id, new_status_id) → room_statuses
room_history (employee_id) → employees
room_history (accommodation_type_id) → accommodation_types
room_rates (room_id) → rooms
cleaning_logs (room_id) → rooms
cleaning_logs (stay_id) → stays
cleaning_logs (employee_id) → employees
maintenance_logs (room_id) → rooms
maintenance_logs (stay_id) → stays
maintenance_logs (employee_id) → employees
maintenance_logs (category_id) → maintenance_categories
maintenance_logs (subcategory_id) → maintenance_subcategories
maintenance_subcategories (category_id) → maintenance_categories
price_overrides (stay_id) → stays
price_overrides (authorized_by) → employees
accommodation_type_price_history (accommodation_type_id) → accommodation_types
```

---

## Enums & Types

### Stay Status
- `Active` - Currently staying
- `Completed` - Finished
- `Cancelled` - Cancelled
- `Reserved` - Reserved but not yet checked in
- `Moved` - Moved to another room

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

### Cleaning Types
- `Aseo parcial` - Partial cleaning
- `Aseo general` - General cleaning

### Room Categories (Legacy)
- `Hotel` - Hotel room
- `Apartamento` - Apartment
- `Casa 1` - House 1
- `Casa 2` - House 2

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
   - `Moved` when transferred to another room

6. **Price History:** Changes to accommodation type prices are tracked in `accommodation_type_price_history` for audit purposes.
