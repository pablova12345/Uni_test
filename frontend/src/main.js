/** Controlador: login, carga de datos, router y pintado de la ventana activa. */
import { api } from "./api.js";
import { autenticar, cerrarSesion, guardarSesion, leerSesion } from "./auth.js";
import { crearRouter, parsearRuta, VISTAS } from "./router.js";
import { vistaConfiguracion } from "./vistas/configuracion.js";
import { vistaLogin } from "./vistas/login.js";
import { vistaMovimientos } from "./vistas/movimientos.js";
import { vistaProductos } from "./vistas/productos.js";
import { vistaResumen } from "./vistas/resumen.js";

const estado = {
  sesion: null,
  vista: "resumen",
  config: null,
  productos: [],
  movimientos: [],
  categorias: [],
  resumen: null,
  filtros: { busqueda: "", categoria: "", soloStockBajo: false },
  orden: { columna: "nombre", ascendente: true },
};

const $ = (selector) => document.querySelector(selector);
const contenedor = () => $("#vista");
const pantallaLogin = () => $("#pantalla-login");

function mostrarError(mensaje) {
  const caja = $("#error");
  caja.textContent = mensaje;
  caja.hidden = !mensaje;
}

function pintarNavegacion() {
  $("#nav").innerHTML = VISTAS.map(
    (v) => `<a href="#/${v.id}" class="nav-enlace${v.id === estado.vista ? " activo" : ""}">
      <span class="nav-icono" aria-hidden="true">${v.icono}</span>${v.etiqueta}
    </a>`
  ).join("");
}

function pintarVista() {
  pintarNavegacion();
  const titulo = VISTAS.find((v) => v.id === estado.vista)?.etiqueta ?? "";
  $("#titulo-vista").textContent = titulo;

  if (estado.vista === "resumen") {
    contenedor().innerHTML = vistaResumen({
      resumen: estado.resumen,
      categorias: estado.categorias,
      productos: estado.productos,
    });
  } else if (estado.vista === "productos") {
    contenedor().innerHTML = vistaProductos({
      productos: estado.productos,
      config: estado.config,
      filtros: estado.filtros,
      orden: estado.orden,
    });
  } else if (estado.vista === "movimientos") {
    contenedor().innerHTML = vistaMovimientos({
      productos: estado.productos,
      movimientos: estado.movimientos,
      config: estado.config,
    });
  } else {
    contenedor().innerHTML = vistaConfiguracion({ config: estado.config });
  }
}

async function recargarDatos() {
  const [productos, movimientos, resumen, categorias] = await Promise.all([
    api.listarProductos(),
    api.listarMovimientos(),
    api.obtenerResumen(),
    api.obtenerResumenCategorias(),
  ]);
  Object.assign(estado, { productos, movimientos, resumen, categorias });
}

async function irA(ruta) {
  estado.vista = ruta.vista;
  if (!ruta.encontrada && ruta.solicitada) {
    mostrarError(`La ventana "${ruta.solicitada}" no existe; se muestra el Resumen.`);
  }
  pintarVista();
}

// --- login --------------------------------------------------------------------
function pintarLogin(datos = {}) {
  pantallaLogin().innerHTML = vistaLogin(datos);
  pantallaLogin().hidden = false;
  $("#app").hidden = true;
  pantallaLogin().querySelector("input[name=usuario]")?.focus();
}

pantallaLogin().addEventListener("submit", async (e) => {
  if (e.target.id !== "form-login") return;
  e.preventDefault();
  const datos = new FormData(e.target);
  const usuario = datos.get("usuario");
  const resultado = autenticar(usuario, datos.get("contrasena"));

  if (!resultado.ok) {
    pintarLogin({ error: resultado.error, usuario });
    return;
  }

  estado.sesion = guardarSesion(resultado.sesion);
  pantallaLogin().hidden = true;
  pantallaLogin().innerHTML = "";
  await arrancarApp();
});

function pintarSesion() {
  $("#sesion-nombre").textContent = estado.sesion.nombre;
  $("#sesion-rol").textContent = estado.sesion.rol;
}

$("#salir").addEventListener("click", () => {
  estado.sesion = cerrarSesion();
  mostrarError("");
  pintarLogin();
});

// --- eventos delegados (se enlazan una sola vez) ------------------------------
contenedor().addEventListener("input", (e) => {
  if (e.target.id !== "busqueda") return;
  estado.filtros.busqueda = e.target.value;
  pintarVista();
  const campo = $("#busqueda");
  campo.focus();
  campo.setSelectionRange(campo.value.length, campo.value.length);
});

contenedor().addEventListener("change", (e) => {
  if (e.target.id === "categoria") {
    estado.filtros.categoria = e.target.value;
    pintarVista();
  } else if (e.target.id === "stock-bajo") {
    estado.filtros.soloStockBajo = e.target.checked;
    pintarVista();
  }
});

contenedor().addEventListener("click", async (e) => {
  const cabecera = e.target.closest("th[data-col]");
  if (cabecera) {
    const col = cabecera.dataset.col;
    estado.orden.ascendente = estado.orden.columna === col ? !estado.orden.ascendente : true;
    estado.orden.columna = col;
    pintarVista();
    return;
  }
  if (e.target.classList.contains("borrar")) {
    try {
      await api.eliminarProducto(Number(e.target.dataset.id));
      await recargarDatos();
      mostrarError("");
      pintarVista();
    } catch (error) {
      mostrarError(error.message);
    }
  }
});

contenedor().addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(e.target);
  try {
    if (e.target.id === "form-nuevo") {
      await api.crearProducto({
        nombre: datos.get("nombre"),
        categoria: datos.get("categoria"),
        cantidad: Number(datos.get("cantidad")),
        precio: Number(datos.get("precio")),
      });
    } else if (e.target.id === "form-movimiento") {
      await api.registrarMovimiento({
        producto_id: Number(datos.get("producto_id")),
        tipo: datos.get("tipo"),
        cantidad: Number(datos.get("cantidad")),
        motivo: datos.get("motivo"),
      });
    }
    await recargarDatos();
    mostrarError("");
    pintarVista();
  } catch (error) {
    mostrarError(error.message);
  }
});

// Tooltip del grafico de barras (capa de hover del dashboard).
const tooltip = $("#tooltip");
contenedor().addEventListener("pointerover", (e) => {
  const fila = e.target.closest("[data-tooltip]");
  if (!fila) return;
  tooltip.textContent = fila.dataset.tooltip;
  tooltip.hidden = false;
  const caja = fila.getBoundingClientRect();
  const ancho = tooltip.offsetWidth;
  const izquierda = Math.min(Math.max(8, caja.left), window.innerWidth - ancho - 8);
  tooltip.style.left = `${izquierda}px`;
  tooltip.style.top = `${Math.max(8, caja.top - 36)}px`;
});
contenedor().addEventListener("pointerout", (e) => {
  if (e.target.closest("[data-tooltip]")) tooltip.hidden = true;
});

// --- arranque -----------------------------------------------------------------
let routerEnlazado = false;

/** Entra en la aplicacion: ya hay sesion, se cargan los datos y se pinta. */
async function arrancarApp() {
  $("#app").hidden = false;
  pintarSesion();
  try {
    estado.config = await api.obtenerConfig();
    $("#titulo-app").textContent = estado.config.nombre;
    $("#version").textContent = `v${estado.config.version} · ${estado.config.entorno}`;
    await recargarDatos();
    if (!routerEnlazado) {
      // Solo una suscripcion a hashchange, aunque se entre y se salga varias veces.
      crearRouter(irA, window);
      routerEnlazado = true;
    }
    await irA(parsearRuta(window.location.hash));
  } catch (error) {
    mostrarError(`No se pudo conectar con el backend (${error.message}). Arranca uvicorn y recarga.`);
  }
}

async function iniciar() {
  estado.sesion = leerSesion();
  if (estado.sesion) {
    await arrancarApp();
  } else {
    pintarLogin();
  }
}

iniciar();
