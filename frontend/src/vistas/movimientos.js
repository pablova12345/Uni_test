/** Ventana "Movimientos": registrar entradas/salidas y ver el historial. */
export function vistaMovimientos({ productos, movimientos, config }) {
  const filas = movimientos
    .map(
      (m) => `<tr>
        <td class="sub">${m.fecha}</td>
        <td>${m.producto_nombre}</td>
        <td>${
          m.tipo === "entrada"
            ? `<span class="estado estado-ok"><span aria-hidden="true">↓</span> Entrada</span>`
            : `<span class="estado estado-aviso"><span aria-hidden="true">↑</span> Salida</span>`
        }</td>
        <td class="num">${m.tipo === "entrada" ? "+" : "−"}${m.cantidad}</td>
        <td>${m.motivo}</td>
        <td class="num">${m.cantidad_resultante}</td>
      </tr>`
    )
    .join("");

  return `
    <section class="panel">
      <h2>Registrar movimiento</h2>
      <p class="sub">Una entrada suma unidades al almacen; una salida las resta y nunca deja el stock en negativo.</p>
      <form id="form-movimiento" class="fila-controles">
        <select name="producto_id" required>
          ${productos
            .map((p) => `<option value="${p.id}">${p.nombre} (${p.cantidad} uds)</option>`)
            .join("")}
        </select>
        <select name="tipo" required>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <label class="campo">Cantidad <input name="cantidad" type="number" min="1" value="1" required /></label>
        <select name="motivo" required>
          ${config.motivos_movimiento.map((m) => `<option value="${m}">${m}</option>`).join("")}
        </select>
        <button type="submit">Registrar</button>
      </form>
    </section>

    <section class="panel">
      <h2>Historial (${movimientos.length})</h2>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th class="num">Cantidad</th><th>Motivo</th><th class="num">Stock final</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      ${movimientos.length === 0 ? `<p class="sub">Todavia no hay movimientos registrados.</p>` : ""}
    </section>`;
}
