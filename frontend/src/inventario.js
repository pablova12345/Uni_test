/** Logica pura del inventario: facil de testear sin navegador ni servidor. */

export function formatearMoneda(valor, moneda = "Bs") {
  return `${valor.toFixed(2)} ${moneda}`;
}

/** Filtra por texto de busqueda, categoria y stock bajo. */
export function filtrarProductos(productos, { busqueda = "", categoria = "", soloStockBajo = false } = {}) {
  const texto = busqueda.trim().toLowerCase();
  return productos.filter((p) => {
    const coincideTexto = texto === "" || p.nombre.toLowerCase().includes(texto);
    const coincideCategoria = categoria === "" || p.categoria === categoria;
    const coincideStock = !soloStockBajo || p.stock_bajo === true;
    return coincideTexto && coincideCategoria && coincideStock;
  });
}

/** Calcula los totales en el cliente a partir de la lista visible. */
export function calcularResumen(productos, moneda = "Bs") {
  const unidades = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const valor = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
  return {
    totalProductos: productos.length,
    unidades,
    valorInventario: Number(valor.toFixed(2)),
    productosStockBajo: productos.filter((p) => p.stock_bajo).length,
    moneda,
  };
}

/** Ordena por una columna; 'nombre' y 'categoria' alfabetico, el resto numerico. */
export function ordenarProductos(productos, columna = "nombre", ascendente = true) {
  const factor = ascendente ? 1 : -1;
  return [...productos].sort((a, b) => {
    if (columna === "nombre" || columna === "categoria") {
      return a[columna].localeCompare(b[columna]) * factor;
    }
    return (a[columna] - b[columna]) * factor;
  });
}

/**
 * Escala las filas del grafico de barras: el valor mas alto ocupa el 100%.
 * Devuelve el porcentaje de ancho de cada barra (0 si todo vale 0).
 */
export function escalarBarras(filas, campo = "valor") {
  const maximo = Math.max(0, ...filas.map((f) => f[campo]));
  return filas.map((fila) => ({
    ...fila,
    porcentaje: maximo === 0 ? 0 : Number(((fila[campo] / maximo) * 100).toFixed(1)),
  }));
}
