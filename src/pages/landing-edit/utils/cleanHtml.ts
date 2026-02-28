/**
 * Limpia el HTML de atributos y elementos de Craft.js
 */
export const cleanHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const container = doc.body.firstElementChild;

  if (!container) return html;

  // Eliminar atributos de Craft.js de todos los elementos
  const allElements = container.querySelectorAll("*");
  allElements.forEach((el) => {
    // Eliminar atributo draggable
    el.removeAttribute("draggable");

    // Eliminar data-craft-* attributes
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-craft")) {
        el.removeAttribute(attr.name);
      }
    });

    // Eliminar estilos de pointer-events si existen (usados en edición)
    const style = el.getAttribute("style") || "";
    if (style.includes("pointer-events")) {
      const newStyle = style.replace(/pointer-events:\s*[^;]+;?/g, "");
      if (newStyle.trim()) {
        el.setAttribute("style", newStyle);
      } else {
        el.removeAttribute("style");
      }
    }
  });

  return container.outerHTML;
};
