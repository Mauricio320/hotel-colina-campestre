import dayjs from "dayjs";
import "dayjs/locale/es";
import { addLocale } from "primereact/api";

export const setupGlobalLocale = () => {
  // Configurar locale para dayjs
  dayjs.locale("es");

  // Configurar locale para PrimeReact
  addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ],
    dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
    today: "Hoy",
    clear: "Limpiar",
  });
};
