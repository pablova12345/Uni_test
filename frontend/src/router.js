/** Router por hash: cada "ventana" de la app es una ruta #/nombre. */

export const VISTAS = [
  { id: "resumen", etiqueta: "Resumen", icono: "▦" },
  { id: "productos", etiqueta: "Productos", icono: "▤" },
  { id: "movimientos", etiqueta: "Movimientos", icono: "⇅" },
  { id: "configuracion", etiqueta: "Configuracion", icono: "⚙" },
];

export const VISTA_POR_DEFECTO = "resumen";

const IDS = VISTAS.map((v) => v.id);

/**
 * Convierte un hash en una ruta. Devuelve siempre una vista valida:
 * un hash vacio o desconocido cae en la vista por defecto.
 */
export function parsearRuta(hash) {
  const limpio = String(hash ?? "")
    .replace(/^#\/?/, "")
    .split("?")[0]
    .trim()
    .toLowerCase();

  if (limpio === "") {
    return { vista: VISTA_POR_DEFECTO, encontrada: true };
  }
  if (!IDS.includes(limpio)) {
    return { vista: VISTA_POR_DEFECTO, encontrada: false, solicitada: limpio };
  }
  return { vista: limpio, encontrada: true };
}

/** Enlaza el evento hashchange con el callback de pintado. */
export function crearRouter(alCambiar, ventana = globalThis) {
  const navegar = () => alCambiar(parsearRuta(ventana.location?.hash));
  ventana.addEventListener("hashchange", navegar);
  return { navegar };
}
