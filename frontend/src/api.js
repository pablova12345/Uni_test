/** Cliente HTTP del backend. El fetch se mockea en los tests. */
const BASE_URL = import.meta.env?.VITE_API_URL ?? "http://127.0.0.1:8000";

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (!respuesta.ok) {
    let detalle = `Error ${respuesta.status} al llamar a ${ruta}`;
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo?.detail) detalle = cuerpo.detail;
    } catch {
      /* la respuesta no traia JSON: nos quedamos con el mensaje generico */
    }
    throw new Error(detalle);
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

export const api = {
  obtenerConfig: () => peticion("/api/config"),
  listarProductos: () => peticion("/api/productos"),
  crearProducto: (producto) =>
    peticion("/api/productos", { method: "POST", body: JSON.stringify(producto) }),
  eliminarProducto: (id) => peticion(`/api/productos/${id}`, { method: "DELETE" }),
  listarMovimientos: () => peticion("/api/movimientos"),
  registrarMovimiento: (movimiento) =>
    peticion("/api/movimientos", { method: "POST", body: JSON.stringify(movimiento) }),
  obtenerResumen: () => peticion("/api/resumen"),
  obtenerResumenCategorias: () => peticion("/api/resumen/categorias"),
};
