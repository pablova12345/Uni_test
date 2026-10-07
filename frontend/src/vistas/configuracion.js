/** Ventana "Configuracion": muestra lo que viene de config.json (solo lectura). */
export function vistaConfiguracion({ config }) {
  const fila = (clave, valor, nota) =>
    `<tr><td><code>${clave}</code></td><td>${valor}</td><td class="sub">${nota}</td></tr>`;

  return `
    <section class="panel">
      <h2>Configuracion activa</h2>
      <p class="sub">
        Estos valores los sirve el backend desde <code>config.json</code>. Edita ese archivo,
        reinicia la API y la aplicacion cambia de comportamiento sin tocar codigo.
      </p>
      <table>
        <thead><tr><th>Clave</th><th>Valor</th><th>Para que sirve</th></tr></thead>
        <tbody>
          ${fila("app.nombre", config.nombre, "titulo que ves arriba a la izquierda")}
          ${fila("app.version", config.version, "version mostrada en la cabecera")}
          ${fila("app.entorno", config.entorno, "entorno de ejecucion")}
          ${fila("inventario.moneda", config.moneda, "sufijo de todos los importes")}
          ${fila("inventario.stock_minimo", config.stock_minimo, "por debajo de este valor el producto marca stock bajo")}
          ${fila("inventario.iva", `${(config.iva * 100).toFixed(0)} %`, "se usa para calcular el valor con IVA")}
          ${fila("inventario.categorias", config.categorias.join(", "), "categorias validas al crear un producto")}
          ${fila("inventario.motivos_movimiento", config.motivos_movimiento.join(", "), "motivos validos al registrar un movimiento")}
        </tbody>
      </table>
    </section>

    <section class="panel">
      <h2>Pruebalo</h2>
      <ol class="pasos">
        <li>Abre <code>config.json</code> en la raiz del proyecto.</li>
        <li>Cambia <code>inventario.stock_minimo</code> de <code>${config.stock_minimo}</code> a <code>10</code>.</li>
        <li>Reinicia <code>uvicorn</code> y recarga esta pagina: cambian los avisos del Resumen.</li>
      </ol>
    </section>`;
}
