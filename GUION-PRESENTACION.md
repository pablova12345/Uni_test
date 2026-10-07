# Guion de la presentacion — Gestor de Inventario

Duracion objetivo: **8-10 minutos**. Antes de empezar deja preparadas **dos terminales**
abiertas en la carpeta del proyecto y el `config.json` abierto en el editor.

---

## 0. Preparacion (antes de que entre nadie)

```bash
# Terminal 1
cd backend
.venv\Scripts\activate
```

```bash
# Terminal 2
cd frontend
```

Comprueba que no quedan servidores de una prueba anterior ocupando los puertos 8000 y 5173.

---

## 1. Apertura (30 segundos)

> "He hecho un **gestor de inventario** para un almacen de informatica. Tiene un backend en
> Python con FastAPI y un frontend en JavaScript, separados: se comunican por una API REST.
> Los datos estan mockeados en memoria, asi que no necesita base de datos para funcionar.
> Lo he organizado en cuatro ventanas detras de un login y tiene siete tests automaticos,
> tres del backend y cuatro del frontend."

No enseñes codigo todavia. Primero que vean que funciona.

---

## 2. El archivo de configuracion (1 minuto)

Abre `config.json` y enseñalo.

> "Todo lo que puede cambiar sin tocar codigo esta en este unico archivo: la moneda, el IVA,
> el stock minimo que dispara las alertas, las categorias validas y los motivos de movimiento.
> El backend lo lee al arrancar y lo valida."

Señala concretamente `stock_minimo: 5` — lo vas a usar al final para la demo mas vistosa.

---

## 3. Arrancar el backend (1 minuto)

```bash
# Terminal 1
uvicorn app.main:app --reload
```

Abre http://127.0.0.1:8000/docs

> "FastAPI genera esta documentacion automaticamente a partir de los modelos. Aqui estan los
> nueve endpoints y se pueden probar desde el navegador."

Ejecuta `GET /api/resumen` desde la propia pagina. Sale el JSON con los totales.

---

## 4. Arrancar el frontend, entrar y recorrer las 4 ventanas (3-4 minutos)

```bash
# Terminal 2
npm run dev
```

Abre http://localhost:5173

**Login** — lo primero que aparece es la pantalla de acceso. Hazla en este orden:

1. Entra con `admin` y una contrasena equivocada, pulsa Entrar.
   > "Las credenciales se validan antes de entrar: si no coinciden, avisa y no deja pasar. El
   > mensaje es el mismo si falla el usuario o la contrasena, para no dar pistas."
2. Ahora `admin` / `admin123`.
   > "Es un login mockeado: los usuarios estan en una lista en memoria, en `auth.js`, igual que
   > los productos. No hay servidor de autenticacion. La sesion se guarda en `sessionStorage`,
   > asi que si recargo la pagina sigo dentro, y abajo a la izquierda se ve quien ha entrado y
   > con que rol. El boton Cerrar sesion vuelve a la pantalla de acceso."

**Resumen** — "La cifra grande es el valor total inmovilizado. Debajo los indicadores y un
grafico con el valor por categoria. Use un solo color azul a proposito: el grafico compara
cantidades, y como el nombre de la categoria ya esta a la izquierda, un color por barra no
aportaria informacion. Pasando el raton sale el detalle, y hay un desplegable para ver los
mismos datos en tabla."

**Productos** — Escribe en el buscador, marca "Solo stock bajo", pulsa una cabecera para
ordenar. "Los filtros y la ordenacion se hacen en el cliente; el alta y la baja van al backend."

**Movimientos** — aqui esta la demo fuerte, hazla en este orden:

1. Elige *Raton inalambrico MX (2 uds)*, tipo **Salida**, cantidad **99**, pulsa Registrar.
   > "El backend rechaza la operacion porque no hay stock suficiente y devuelve un 409. El
   > frontend enseña el mensaje tal cual lo manda la API. El historial no se toca."
2. Cambia a **Entrada**, cantidad **20**, motivo Compra, Registrar.
   > "Ahora si: el stock pasa a 22 y aparece la fila en el historial."
3. Vuelve a **Resumen**.
   > "Y mirad: el valor total, las unidades, el numero de avisos y el orden de las barras del
   > grafico han cambiado solos, porque todo se recalcula en el backend."

**Configuracion** — "Esta ventana enseña los valores activos del `config.json` y explica para
que sirve cada uno."

---

## 5. La demo del archivo de configuracion (1 minuto)

Esta es la que mejor demuestra que la configuracion es real y no decorativa.

1. En `config.json`, cambia `"stock_minimo": 5` por `"stock_minimo": 10`.
2. Reinicia uvicorn (Ctrl+C y vuelve a lanzarlo).
3. Recarga la pagina en el navegador.

> "He cambiado un numero en un archivo, sin tocar ni una linea de codigo, y ahora hay mas
> productos marcados como stock bajo: el calculo, las alertas y los avisos han cambiado."

Acuerdate de dejarlo en `5` otra vez al terminar.

---

## 6. Los tests (2-3 minutos)

Lanza los dos en directo, que vean el verde:

```bash
# Terminal 1 (para uvicorn con Ctrl+C antes)
.venv\Scripts\python -m pytest -v
```

```bash
# Terminal 2 (para vite con Ctrl+C antes)
npm test
```

### La frase que tienes que decir sobre el mockeo

> "Los siete tests usan datos mockeados. Eso significa que no tocan ni la base de datos ni el
> servidor: cada test crea sus propios datos de prueba. Asi los resultados son siempre los
> mismos, no dependen de que haya un servidor arrancado, y tardan milisegundos."

Si te preguntan **como** esta mockeado:

- **Backend**: en `tests/conftest.py` hay *fixtures* de pytest que crean un repositorio con
  4 productos inventados y una `Config` inventada. El servicio los recibe por el constructor
  (inyeccion de dependencias), asi que en los tests recibe los falsos en lugar de los reales.
- **Frontend**: en `tests/api.test.js` se sustituye `global.fetch` por `vi.fn()`, una funcion
  falsa de Vitest. Asi se puede decidir que responde el servidor en cada caso (incluido un
  error 409) sin que haya ningun servidor.

### Que hace cada test del backend (`backend/tests/test_service.py`)

**1. `test_resumen_global_y_por_categoria`**
> "Comprueba los numeros que alimentan la ventana Resumen. Con 4 productos mockeados verifica
> que suma bien las 22 unidades, que calcula los 11.350 euros de valor total, que detecta los
> 2 productos por debajo del stock minimo, y que el desglose por categoria agrupa bien y lo
> devuelve ordenado de mayor a menor valor, que es como lo pinta el grafico."

**2. `test_listar_filtra_y_crear_valida_la_categoria`**
> "Comprueba la ventana Productos. Que el filtro por categoria devuelve los dos perifericos,
> que marca correctamente cual tiene stock bajo y cual no, que aplica el 21% de IVA que viene
> del config, y que al crear un producto con una categoria que no esta en el `config.json`
> lanza un error y **no** lo guarda."

**3. `test_movimientos_actualizan_el_stock_y_su_historial`**
> "Comprueba la ventana Movimientos, que es la logica mas delicada. Que una entrada de 8
> unidades sube el stock de 2 a 10 y deja de estar en alerta; que una salida de 4 lo baja de
> 10 a 6; que si pides sacar 99 unidades de un producto que tiene 4, lanza un error de stock
> insuficiente y deja el stock intacto; que rechaza un motivo que no este en el config; y que
> el historial acaba con los 3 movimientos ordenados por fecha."

### Que hace cada test del frontend (`frontend/tests/`)

**1. `inventario.test.js` — logica pura**
> "Prueba las funciones de calculo del cliente sin navegador: el resumen, el formato de los
> importes, los tres filtros, la ordenacion (y que ordenar no modifica el array original) y el
> escalado de las barras del grafico, que convierte los valores en porcentajes de forma que la
> barra mas alta ocupe el 100%. Tambien comprueba el caso limite de que todo valga cero, para
> que no haya una division por cero."

**2. `router.test.js` — la navegacion entre ventanas**
> "Prueba el router. Que las cuatro ventanas resuelven su ruta, que un hash vacio o nulo cae
> en la ventana por defecto, que da igual escribirlo en mayusculas o con parametros detras, y
> que una ruta inventada como `#/facturas` no rompe nada: devuelve el Resumen marcado como
> 'no encontrada' para poder avisar al usuario."

**3. `api.test.js` — el cliente HTTP con `fetch` mockeado**
> "Prueba la comunicacion con el backend sin backend. Que las peticiones GET llaman a la URL
> correcta y devuelven los datos, que el POST envia el cuerpo serializado en JSON con el metodo
> correcto, y lo mas importante: que cuando el servidor responde un error, el mensaje concreto
> que manda FastAPI llega hasta el usuario — exactamente el aviso de stock insuficiente que
> habeis visto antes en pantalla."

**4. `auth.test.js` — el login mockeado**
> "Prueba el acceso sin navegador. Que `admin` / `admin123` entra y que el objeto de sesion que
> devuelve no lleva la contrasena dentro; que una contrasena mala y un usuario inexistente dan
> el mismo mensaje, para no decirle a nadie que usuarios existen; que el usuario se normaliza
> pero la contrasena no; y el ciclo de la sesion (guardar, leer, cerrar) con un `sessionStorage`
> falso, incluido el caso de que lo guardado este corrupto: entonces se trata como que no hay
> sesion y se vuelve a pedir el login."

---

## 6 bis. El informe HTML (1 minuto)

Despues de lanzar pytest, en la terminal aparece la ruta del informe. Abrelo:

```
backend/reports/informe-tests.html
```

> "Ademas de la salida en la terminal, pytest genera un informe en HTML. Lo tengo configurado
> en el `pytest.ini`, asi que se regenera solo cada vez que lanzo los tests, sin escribir
> ningun parametro."

Lo que debes señalar en pantalla, en este orden:

1. **La tabla *Environment*** — "Recoge la version de Python y el sistema, y le he añadido tres
   datos propios desde el `conftest.py`: el proyecto, la capa y que los datos son mockeados."
2. **El resumen con los filtros** — "3 passed. Las casillas de arriba permiten filtrar por
   estado, util cuando hay muchos tests."
3. **La columna "Que comprueba"** — "Esta columna la he añadido yo con un hook de pytest:
   coge automaticamente el docstring de cada funcion de test, asi que el informe se documenta
   solo y lo entiende alguien que no sepa leer el codigo."
4. **Que es autocontenido** — "Lleva el CSS y el JavaScript dentro del propio archivo, asi que
   se puede entregar o enviar por correo tal cual."

Si te preguntan **que se ve cuando algo falla**: la fila sale en rojo, se ordena la primera y
despliega el traceback completo con la linea exacta del fallo. (Si quieres enseñarlo en
directo, cambia a proposito un numero esperado en un test, lanza pytest, enseña el rojo y
deshaz el cambio.)

---

## 7. Cierre (30 segundos)

> "En resumen: backend y frontend separados comunicados por una API REST, todo parametrizado
> desde un unico archivo de configuracion, cuatro ventanas detras de un login, y siete tests
> con datos mockeados que verifican los calculos, las validaciones de negocio, el acceso, la
> navegacion y la comunicacion,
> con un informe HTML que se genera solo en cada ejecucion."

---

## Preguntas probables y como responderlas

**"¿Por que no usas una base de datos?"**
> "La capa de acceso a datos esta aislada en `repository.py`. Hoy devuelve una lista en
> memoria, pero el servicio no sabe de donde vienen los datos: para pasar a PostgreSQL solo
> habria que reescribir esa clase, sin tocar la logica de negocio ni los tests."

**"¿Que diferencia hay entre un test unitario y uno de integracion?"**
> "El unitario prueba una pieza aislada, sustituyendo sus dependencias por falsas, que es lo
> que hago aqui. El de integracion probaria el sistema entero con el servidor y la base de
> datos reales arrancados."

**"¿Por que la logica de negocio esta en `service.py` y no en `main.py`?"**
> "Para poder testearla sin levantar el servidor. `main.py` solo traduce peticiones HTTP; toda
> la logica esta en el servicio, y los tests lo llaman directamente."

**"¿Que pasa si el backend no esta arrancado?"**
> "El frontend lo detecta y enseña un aviso explicando que hay que arrancar uvicorn, en lugar
> de quedarse en blanco."

---

## Checklist de ultimo minuto

- [ ] `stock_minimo` esta en `5` en `config.json`
- [ ] Las dos terminales abiertas y en su carpeta, con el venv activado en la del backend
- [ ] Puertos 8000 y 5173 libres
- [ ] `config.json` abierto en el editor, listo para enseñar
- [ ] Zoom del navegador al 110-125% para que se lea desde el fondo del aula
- [ ] Credenciales del login a mano: `admin` / `admin123` (salen tambien en la propia pantalla)
- [ ] Sesion cerrada antes de empezar, para que se vea la pantalla de acceso
- [ ] `backend/reports/informe-tests.html` generado y listo para abrir
