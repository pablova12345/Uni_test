/** Test 2 de los 4 unit tests del frontend: el router de las ventanas. */
import { describe, expect, it, vi } from "vitest";
import { crearRouter, parsearRuta, VISTAS, VISTA_POR_DEFECTO } from "../src/router.js";

describe("router de ventanas", () => {
  it("test 2: resuelve cada ventana y cae en la de por defecto si no existe", () => {
    expect(VISTAS.map((v) => v.id)).toEqual(["resumen", "productos", "movimientos", "configuracion"]);

    // Cada ventana tiene su ruta
    for (const vista of VISTAS) {
      expect(parsearRuta(`#/${vista.id}`)).toEqual({ vista: vista.id, encontrada: true });
    }

    // Hash vacio, nulo o solo "#" -> ventana por defecto
    for (const hash of ["", "#", "#/", null, undefined]) {
      expect(parsearRuta(hash)).toEqual({ vista: VISTA_POR_DEFECTO, encontrada: true });
    }

    // Mayusculas y query string se normalizan
    expect(parsearRuta("#/PRODUCTOS?pagina=2")).toEqual({ vista: "productos", encontrada: true });

    // Ruta desconocida -> por defecto, marcada como no encontrada
    expect(parsearRuta("#/facturas")).toEqual({
      vista: VISTA_POR_DEFECTO,
      encontrada: false,
      solicitada: "facturas",
    });

    // crearRouter se suscribe a hashchange y navega bajo demanda
    const alCambiar = vi.fn();
    const ventanaFalsa = { addEventListener: vi.fn(), location: { hash: "#/movimientos" } };
    const router = crearRouter(alCambiar, ventanaFalsa);

    expect(ventanaFalsa.addEventListener).toHaveBeenCalledWith("hashchange", expect.any(Function));
    router.navegar();
    expect(alCambiar).toHaveBeenCalledWith({ vista: "movimientos", encontrada: true });
  });
});
