/**
 * Login MOCKEADO: usuarios en memoria y sesion guardada en sessionStorage.
 * La logica es pura (no toca el DOM) para poder testearla sin navegador.
 */

/** Usuarios de demostracion. En una app real esto viviria en el backend. */
export const USUARIOS_MOCK = [
  { usuario: "admin", contrasena: "admin123", nombre: "Ana Admin", rol: "Administrador" },
  { usuario: "demo", contrasena: "demo123", nombre: "Diego Demo", rol: "Solo lectura" },
];

export const CLAVE_SESION = "gestor-inventario-sesion";

/** sessionStorage si existe (navegador); null en los tests de Node. */
function almacenPorDefecto() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; /* algunos navegadores lanzan si las cookies estan bloqueadas */
  }
}

/**
 * Comprueba las credenciales contra la lista de usuarios.
 * Devuelve { ok: true, sesion } sin la contrasena, o { ok: false, error }.
 */
export function autenticar(usuario, contrasena, usuarios = USUARIOS_MOCK) {
  const nombre = String(usuario ?? "").trim().toLowerCase();
  const clave = String(contrasena ?? "");

  if (nombre === "" || clave === "") {
    return { ok: false, error: "Escribe el usuario y la contrasena." };
  }

  const encontrado = usuarios.find((u) => u.usuario === nombre);
  if (!encontrado || encontrado.contrasena !== clave) {
    return { ok: false, error: "Usuario o contrasena incorrectos." };
  }

  const { contrasena: _oculta, ...sesion } = encontrado;
  return { ok: true, sesion };
}

/** Guarda la sesion para que al recargar la pagina no haya que entrar otra vez. */
export function guardarSesion(sesion, almacen = almacenPorDefecto()) {
  try {
    almacen?.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    /* sin almacenamiento la sesion solo vive en memoria: no es un error */
  }
  return sesion;
}

/** Recupera la sesion guardada, o null si no hay o esta corrupta. */
export function leerSesion(almacen = almacenPorDefecto()) {
  try {
    const crudo = almacen?.getItem(CLAVE_SESION);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo);
    return typeof sesion?.usuario === "string" ? sesion : null;
  } catch {
    return null;
  }
}

export function cerrarSesion(almacen = almacenPorDefecto()) {
  try {
    almacen?.removeItem(CLAVE_SESION);
  } catch {
    /* nada que limpiar */
  }
  return null;
}
