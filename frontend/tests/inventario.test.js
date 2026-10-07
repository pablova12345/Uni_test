/** Test 1 de los 4 unit tests del frontend: logica pura de datos y grafico. */
import { describe, expect, it } from "vitest";
import {
  calcularResumen,
  escalarBarras,
  filtrarProductos,
  formatearMoneda,
  ordenarProductos,
} from "../src/inventario.js";
import { CATEGORIAS_MOCK, PRODUCTOS_MOCK } from "./mocks.js";

describe("logica de inventario", () => {
  it("test 1: resume, filtra, ordena y escala las barras del grafico", () => {
    // Resumen y formato (ventana Resumen)
    expect(calcularResumen(PRODUCTOS_MOCK, "Bs")).toEqual({
      totalProductos: 3,
      unidades: 16,              // 10 + 2 + 4
      valorInventario: 10900,    // 10000 + 100 + 800
      productosStockBajo: 2,
      moneda: "Bs",
    });
    expect(formatearMoneda(10900, "Bs")).toBe("10900.00 Bs");

    // Filtros y ordenacion (ventana Productos)
    expect(filtrarProductos(PRODUCTOS_MOCK, { busqueda: "  raton " }).map((p) => p.id)).toEqual([2]);
    expect(filtrarProductos(PRODUCTOS_MOCK, { categoria: "Monitores" }).map((p) => p.id)).toEqual([3]);
    expect(filtrarProductos(PRODUCTOS_MOCK, { soloStockBajo: true }).map((p) => p.id)).toEqual([2, 3]);
    expect(filtrarProductos(PRODUCTOS_MOCK, { categoria: "Portatiles", soloStockBajo: true })).toHaveLength(0);
    expect(ordenarProductos(PRODUCTOS_MOCK, "cantidad", true).map((p) => p.cantidad)).toEqual([2, 4, 10]);
    expect(PRODUCTOS_MOCK[0].nombre).toBe("Portatil Test"); // ordenar no muta el original

    // Escalado de las barras: el valor mas alto ocupa el 100%
    expect(escalarBarras(CATEGORIAS_MOCK, "valor").map((f) => f.porcentaje)).toEqual([100, 8, 1]);
    expect(escalarBarras([{ valor: 0 }, { valor: 0 }], "valor").map((f) => f.porcentaje)).toEqual([0, 0]);
  });
});
