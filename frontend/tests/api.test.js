/** Test 3 de los 4 unit tests del frontend: cliente HTTP con fetch mockeado. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../src/api.js";
import { MOVIMIENTOS_MOCK, PRODUCTOS_MOCK } from "./mocks.js";

describe("cliente api", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("test 3: lee listados, envia los POST y propaga el detalle de los errores", async () => {
    // GET /api/productos
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => PRODUCTOS_MOCK });
    const productos = await api.listarProductos();
    expect(fetch.mock.calls[0][0]).toContain("/api/productos");
    expect(productos.map((p) => p.nombre)).toEqual(["Portatil Test", "Raton Test", "Monitor Test"]);

    // GET /api/movimientos
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => MOVIMIENTOS_MOCK });
    const movimientos = await api.listarMovimientos();
    expect(fetch.mock.calls[1][0]).toContain("/api/movimientos");
    expect(movimientos[0].tipo).toBe("salida");

    // POST /api/movimientos con el cuerpo serializado
    const movimiento = { producto_id: 2, tipo: "entrada", cantidad: 5, motivo: "Compra" };
    fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 3, ...movimiento }) });
    const creado = await api.registrarMovimiento(movimiento);
    const [, opciones] = fetch.mock.calls[2];
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toEqual(movimiento);
    expect(creado.id).toBe(3);

    // Error de negocio: se muestra el "detail" que manda FastAPI
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: "Stock insuficiente de 'Raton Test': hay 2, se piden 99" }),
    });
    await expect(api.registrarMovimiento({ ...movimiento, tipo: "salida", cantidad: 99 })).rejects.toThrow(
      "Stock insuficiente de 'Raton Test': hay 2, se piden 99"
    );

    // Error sin cuerpo JSON: mensaje generico con el codigo y la ruta
    fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => { throw new Error("no json"); } });
    await expect(api.obtenerResumen()).rejects.toThrow("Error 500 al llamar a /api/resumen");
  });
});
