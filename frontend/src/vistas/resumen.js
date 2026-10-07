/** Ventana "Resumen": cifra principal, KPIs y desglose por categoria. */
import { escalarBarras, formatearMoneda } from "../inventario.js";

function tarjeta(etiqueta, valor, extra = "") {
  return `<article class="kpi">
    <span class="kpi-etiqueta">${etiqueta}</span>
    <strong class="kpi-valor">${valor}</strong>
    ${extra}
  </article>`;
}

/**
 * Grafico de barras horizontal: una sola serie (valor por categoria),
 * asi que un unico tono azul y sin leyenda. Etiqueta directa en la punta.
 */
function barras(categorias, moneda) {
  const filas = escalarBarras(categorias, "valor");
  const cuerpo = filas
    .map(
      (f) => `<div class="barra-fila" tabindex="0"
          data-tooltip="${f.categoria}: ${f.productos} ${f.productos === 1 ? "producto" : "productos"} · ${f.unidades} uds · ${formatearMoneda(f.valor, moneda)}">
        <span class="barra-etiqueta">${f.categoria}</span>
        <span class="barra-pista"><span class="barra-marca" style="width:${f.porcentaje}%"></span></span>
        <span class="barra-valor">${formatearMoneda(f.valor, moneda)}</span>
      </div>`
    )
    .join("");

  const tabla = filas
    .map(
      (f) => `<tr><td>${f.categoria}</td><td class="num">${f.productos}</td>
        <td class="num">${f.unidades}</td><td class="num">${formatearMoneda(f.valor, moneda)}</td></tr>`
    )
    .join("");

  return `<section class="panel">
    <h2>Valor del inventario por categoria</h2>
    <p class="sub">Importe inmovilizado en cada categoria, de mayor a menor.</p>
    <div class="barras">${cuerpo}</div>
    <details class="tabla-alt">
      <summary>Ver los datos como tabla</summary>
      <table>
        <thead><tr><th>Categoria</th><th class="num">Productos</th><th class="num">Unidades</th><th class="num">Valor</th></tr></thead>
        <tbody>${tabla}</tbody>
      </table>
    </details>
  </section>`;
}

export function vistaResumen({ resumen, categorias, productos }) {
  const bajos = productos.filter((p) => p.stock_bajo);
  const alerta =
    bajos.length === 0
      ? `<p class="sub">Ningun producto por debajo del minimo.</p>`
      : `<ul class="lista-alerta">${bajos
          .map(
            (p) =>
              `<li><span class="estado estado-critico"><span aria-hidden="true">▲</span> Stock bajo</span>
               ${p.nombre} — ${p.cantidad} uds <span class="sub">(${p.categoria})</span></li>`
          )
          .join("")}</ul>`;

  return `
    <section class="panel hero-panel">
      <span class="kpi-etiqueta">Valor total del inventario</span>
      <p class="hero">${formatearMoneda(resumen.valor_inventario, resumen.moneda)}</p>
      <p class="sub">IVA no incluido · ${resumen.total_productos} referencias en almacen</p>
    </section>

    <section class="kpis">
      ${tarjeta("Referencias", resumen.total_productos)}
      ${tarjeta("Unidades", resumen.unidades)}
      ${tarjeta(
        "Productos con stock bajo",
        resumen.productos_stock_bajo,
        resumen.productos_stock_bajo > 0
          ? `<span class="estado estado-critico"><span aria-hidden="true">▲</span> Revisar</span>`
          : `<span class="estado estado-ok"><span aria-hidden="true">●</span> Correcto</span>`
      )}
    </section>

    ${barras(categorias, resumen.moneda)}

    <section class="panel">
      <h2>Avisos de reposicion</h2>
      ${alerta}
    </section>`;
}
