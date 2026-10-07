/** Test 4 de los 4 unit tests del frontend: el login mockeado y la sesion. */
import { describe, expect, it } from "vitest";
import { autenticar, cerrarSesion, CLAVE_SESION, guardarSesion, leerSesion, USUARIOS_MOCK } from "../src/auth.js";

/** sessionStorage falso: en Node no existe, asi que se inyecta uno de mentira. */
function almacenFalso(inicial = {}) {
  const datos = { ...inicial };
  return {
    datos,
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => {
      datos[clave] = String(valor);
    },
    removeItem: (clave) => {
      delete datos[clave];
    },
  };
}

describe("login mockeado", () => {
  it("test 4: valida credenciales, no expone la contrasena y gestiona la sesion", () => {
    expect(USUARIOS_MOCK.map((u) => u.usuario)).toEqual(["admin", "demo"]);

    // Credenciales correctas: devuelve la sesion sin la contrasena
    const correcto = autenticar("admin", "admin123");
    expect(correcto.ok).toBe(true);
    expect(correcto.sesion).toEqual({ usuario: "admin", nombre: "Ana Admin", rol: "Administrador" });
    expect(correcto.sesion).not.toHaveProperty("contrasena");

    // El usuario se normaliza (espacios y mayusculas), la contrasena no
    expect(autenticar("  DEMO  ", "demo123").ok).toBe(true);
    expect(autenticar("demo", "DEMO123").ok).toBe(false);

    // Contrasena incorrecta y usuario inexistente: mismo mensaje, sin pistas
    for (const intento of [["admin", "1234"], ["fulanito", "demo123"]]) {
      expect(autenticar(...intento)).toEqual({ ok: false, error: "Usuario o contrasena incorrectos." });
    }

    // Campos vacios o nulos: aviso propio
    for (const intento of [["", ""], ["admin", ""], [null, undefined]]) {
      expect(autenticar(...intento)).toEqual({ ok: false, error: "Escribe el usuario y la contrasena." });
    }

    // Ciclo de la sesion: guardar -> leer -> cerrar
    const almacen = almacenFalso();
    expect(leerSesion(almacen)).toBeNull();

    guardarSesion(correcto.sesion, almacen);
    expect(JSON.parse(almacen.datos[CLAVE_SESION])).toEqual(correcto.sesion);
    expect(leerSesion(almacen)).toEqual(correcto.sesion);

    expect(cerrarSesion(almacen)).toBeNull();
    expect(leerSesion(almacen)).toBeNull();

    // Sesion corrupta o incompleta: se trata como "no hay sesion"
    expect(leerSesion(almacenFalso({ [CLAVE_SESION]: "{no es json" }))).toBeNull();
    expect(leerSesion(almacenFalso({ [CLAVE_SESION]: '{"rol":"Administrador"}' }))).toBeNull();

    // Sin almacenamiento disponible la app sigue funcionando (sesion solo en memoria)
    expect(() => guardarSesion(correcto.sesion, null)).not.toThrow();
    expect(leerSesion(null)).toBeNull();
  });
});
