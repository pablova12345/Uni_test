/** Ventana "Productos": alta, filtros, ordenacion y baja. */
import { filtrarProductos, formatearMoneda, ordenarProductos } from "../inventario.js";

export function vistaProductos({ productos, config, filtros, orden }) {
  const visibles = ordenarProductos(filtrarProductos(productos, filtros), orden.columna, orden.ascendente);
  const flecha = (col) => (orden.columna === col ? (orden.ascendente ? " ▲" : " ▼") : "");

  const filas = visibles
    .map(
      (p) => `<tr class="${p.stock_bajo ? "fila-alerta" : ""}">
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td class="num">${p.cantidad}</td>
        <td class="num">${formatearMoneda(p.precio, config.moneda)}</td>
        <td class="num">${formatearMoneda(p.valor_total, config.moneda)}</td>
        <td>${
          p.stock_bajo
            ? `<span class="estado estado-critico"><span aria-hidden="true">▲</span> Bajo</span>`
            : `<span class="estado estado-ok"><span aria-hidden="true">●</span> OK</span>`
        }</td>
        <td><button class="borrar" data-id="${p.id}">Eliminar</button></td>
      </tr>`
    )
    .join("");

  return `
    <section class="panel">
      <h2>Nuevo producto</h2>
      <form id="form-nuevo" class="fila-controles">
        <input name="nombre" placeholder="Nombre del producto" required />
        <select name="categoria" required>
          ${config.categorias.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <label class="campo">Cantidad <input name="cantidad" type="number" min="0" value="0" required /></label>
        <label class="campo">Precio <input name="precio" type="number" min="0" step="0.01" value="0" required /></label>
        <button type="submit">Anadir</button>
      </form>
    </section>

    <section class="panel">
      <h2>Listado (${visibles.length} de ${productos.length})</h2>
      <div class="fila-controles filtros">
        <input id="busqueda" placeholder="Buscar por nombre..." value="${filtros.busqueda}" />
        <select id="categoria">
          <option value="">Todas las categorias</option>
          ${config.categorias
            .map((c) => `<option value="${c}"${filtros.categoria === c ? " selected" : ""}>${c}</option>`)
            .join("")}
        </select>
        <label class="check">
          <input type="checkbox" id="stock-bajo"${filtros.soloStockBajo ? " checked" : ""} />
          Solo stock bajo
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th data-col="nombre">Producto${flecha("nombre")}</th>
            <th data-col="categoria">Categoria${flecha("categoria")}</th>
            <th data-col="cantidad" class="num">Cantidad${flecha("cantidad")}</th>
            <th data-col="precio" class="num">Precio${flecha("precio")}</th>
            <th data-col="valor_total" class="num">Valor${flecha("valor_total")}</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      ${visibles.length === 0 ? `<p class="sub">Ningun producto coincide con el filtro.</p>` : ""}
    </section>`;
}
