/** Datos MOCKEADOS del frontend (misma forma que devuelve el backend). */
export const PRODUCTOS_MOCK = [
  { id: 1, nombre: "Portatil Test", categoria: "Portatiles", cantidad: 10, precio: 1000, valor_total: 10000, valor_con_iva: 12100, stock_bajo: false },
  { id: 2, nombre: "Raton Test", categoria: "Perifericos", cantidad: 2, precio: 50, valor_total: 100, valor_con_iva: 121, stock_bajo: true },
  { id: 3, nombre: "Monitor Test", categoria: "Monitores", cantidad: 4, precio: 200, valor_total: 800, valor_con_iva: 968, stock_bajo: true },
];

export const CATEGORIAS_MOCK = [
  { categoria: "Portatiles", productos: 1, unidades: 10, valor: 10000 },
  { categoria: "Monitores", productos: 1, unidades: 4, valor: 800 },
  { categoria: "Perifericos", productos: 1, unidades: 2, valor: 100 },
];

export const MOVIMIENTOS_MOCK = [
  { id: 2, producto_id: 1, producto_nombre: "Portatil Test", tipo: "salida", cantidad: 2, motivo: "Venta", fecha: "2026-10-05 12:00", cantidad_resultante: 10 },
  { id: 1, producto_id: 1, producto_nombre: "Portatil Test", tipo: "entrada", cantidad: 12, motivo: "Compra", fecha: "2026-10-01 09:00", cantidad_resultante: 12 },
];
