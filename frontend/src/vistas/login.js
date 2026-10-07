/** Pantalla de acceso: formulario mockeado con los usuarios de la demo. */
import { USUARIOS_MOCK } from "../auth.js";

export function vistaLogin({ error = "", usuario = "" } = {}) {
  const pistas = USUARIOS_MOCK.map(
    (u) => `<li><code>${u.usuario}</code> / <code>${u.contrasena}</code> <span class="sub">— ${u.rol}</span></li>`
  ).join("");

  return `
    <section class="panel tarjeta-login">
      <div class="marca-login">
        <strong>Gestor de Inventario</strong>
        <span class="sub">Identificate para entrar en la aplicacion</span>
      </div>

      ${error ? `<p class="error">${error}</p>` : ""}

      <form id="form-login" class="form-login">
        <label class="campo-login">
          Usuario
          <input name="usuario" value="${usuario}" autocomplete="username" autofocus required />
        </label>
        <label class="campo-login">
          Contrasena
          <input name="contrasena" type="password" autocomplete="current-password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>

      <div class="credenciales">
        <p class="sub">Login mockeado, sin servidor de autenticacion. Usuarios disponibles:</p>
        <ul class="lista-credenciales">${pistas}</ul>
      </div>
    </section>`;
}
