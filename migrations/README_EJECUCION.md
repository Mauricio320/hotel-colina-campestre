# Ejecución de Migración - Nuevos Campos de Configuración

## Pasos para ejecutar la migración:

1. **Conectarse a Supabase Dashboard**
   - Ir a https://supabase.com/dashboard
   - Seleccionar tu proyecto
   - Ir a la sección **SQL Editor**

2. **Ejecutar la migración**
   - Copiar el contenido del archivo: `migrations/003_add_stays_config_fields.sql`
   - Pegar en el SQL Editor
   - Hacer clic en **Run** para ejecutar la migración

3. **Verificar los cambios**
   - Ir a **Table Editor**
   - Seleccionar la tabla `stays`
   - Verificar que los nuevos campos aparecen:
     - `iva_percentage` (INTEGER, DEFAULT 19)
     - `person_count` (INTEGER, DEFAULT 1)  
     - `extra_mattress_count` (INTEGER, DEFAULT 0)
     - `extra_mattress_unit_price` (INTEGER, DEFAULT 0)

## Campos Agregados:

| Campo | Tipo | Default | Descripción |
|-------|------|----------|-------------|
| iva_percentage | INTEGER | 19 | Porcentaje de IVA usado al momento de crear la estadía |
| person_count | INTEGER | 1 | Número de personas que se hospedan |
| extra_mattress_count | INTEGER | 0 | Cantidad de colchonetas adicionales |
| extra_mattress_unit_price | INTEGER | 0 | Valor unitario por colchoneta al momento de la estadía |

## Beneficios:

✅ **Trazabilidad histórica**: Guardamos exactamente qué configuración se usó
✅ **Auditoría**: Podemos rastrear cambios en precios a lo largo del tiempo  
✅ **Reportes precisos**: Los cálculos históricos serán exactos
✅ **Compatibilidad**: Se mantienen los valores existentes con defaults

## Notas Importantes:

- La migración es **segura** y no afecta los datos existentes
- Los registros existentes tendrán los valores por defecto
- Las nuevas estadías guardarán los valores reales de configuración
- No se requiere downtime ni afectación al servicio