# Gestor de Inventario

Proyecto de demostracion con **backend en Python (FastAPI)** y **frontend en JavaScript (Vite)**,
organizado en **4 ventanas** con navegacion lateral y protegido por un **login mockeado**.
Todos los datos estan **mockeados en memoria**: no hace falta instalar ninguna base de datos.

## Acceso (login mockeado)

Al abrir la web aparece primero una pantalla de acceso. No hay servidor de autenticacion: los
usuarios estan mockeados en `frontend/src/auth.js` y la pantalla misma los muestra para la demo.

| Usuario | Contrasena | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `demo` | `demo123` | Solo lectura |

- El usuario no distingue mayusculas ni espacios sobrantes; la contrasena si.
- Si las credenciales no son validas se muestra el aviso y no se entra.
- La sesion se guarda en `sessionStorage`, asi que al recargar la pagina sigue dentro; se cierra
  con el boton **Cerrar sesion** del menu lateral o al cerrar la pestana.
- El nombre y el rol del usuario se ven abajo en el menu lateral.

## Las 4 ventanas

Cada ventana es una ruta por hash, asi que los botones atras/adelante del navegador funcionan
y se puede enlazar directamente a una de ellas.

| Ruta | Ventana | Que hace |
|---|---|---|
| `#/resumen` | **Resumen** | Cifra principal del inventario, KPIs y grafico de valor por categoria |
| `#/productos` | **Productos** | Alta, baja, busqueda, filtro por categoria/stock bajo y ordenacion por columna |
| `#/movimientos` | **Movimientos** | Registrar entradas y salidas de almacen + historial |
| `#/configuracion` | **Configuracion** | Muestra los valores activos de `config.json` y para que sirve cada uno |

Una ruta que no existe (`#/facturas`) cae en el Resumen y avisa al usuario.

## Estructura

```
uni test/
├── config.json                  <- archivo de configuracion (lo lee el backend)
├── backend/
│   ├── conftest.py              configuracion del informe HTML de pytest
│   ├── reports/                 informe-tests.html (se genera solo al lanzar pytest)
│   ├── app/
│   │   ├── config.py            carga y valida config.json
│   │   ├── models.py            modelos Pydantic
│   │   ├── repository.py        DATOS MOCKEADOS (productos y movimientos)
│   │   ├── service.py           logica de negocio (IVA, stock bajo, totales, movimientos)
│   │   └── main.py              API REST
│   ├── tests/                   3 unit tests (pytest)
│   ├── pytest.ini
│   └── requirements.txt
└── frontend/
    ├── index.html               pantalla de login + menu lateral + contenedor de la ventana activa
    ├── src/
    │   ├── auth.js              LOGIN MOCKEADO (usuarios y sesion)
    │   ├── router.js            las 4 ventanas y el router por hash
    │   ├── inventario.js        logica pura (filtrar, ordenar, totales, escalado del grafico)
    │   ├── api.js               cliente HTTP
    │   ├── main.js              estado, eventos y pintado
    │   ├── estilos.css
    │   └── vistas/              una funcion de pintado por ventana
    │       ├── login.js
    │       ├── resumen.js
    │       ├── productos.js
    │       ├── movimientos.js
    │       └── configuracion.js
    ├── tests/                   4 unit tests (vitest, fetch mockeado)
    ├── vite.config.js
    └── package.json
```

## Archivo de configuracion

`config.json` en la raiz controla el comportamiento de la app:

| Clave | Uso |
|---|---|
| `app.nombre`, `app.version`, `app.entorno` | se muestran en el menu lateral |
| `servidor.host`, `servidor.puerto` | donde escucha la API |
| `servidor.origenes_permitidos` | CORS para el frontend |
| `inventario.moneda` | formato de los importes |
| `inventario.stock_minimo` | por debajo de este valor un producto marca "stock bajo" |
| `inventario.iva` | se usa para calcular `valor_con_iva` |
| `inventario.categorias` | categorias validas al crear un producto |
| `inventario.motivos_movimiento` | motivos validos al registrar una entrada o salida |

Cambia `stock_minimo` a `10`, reinicia uvicorn y recarga: cambian las alertas sin tocar codigo.
La ventana **Configuracion** enseña esos valores en pantalla, util para explicarlo en la demo.

## Como arrancar

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (en Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API en http://127.0.0.1:8000 · documentacion automatica en http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Web en http://localhost:5173

## Como lanzar los tests

```bash
cd backend  && .venv\Scripts\python -m pytest -v   # 3 tests
cd frontend && npm test                            # 4 tests
```

### Informe HTML de los tests

El backend genera un informe HTML en cada ejecucion, sin pasar ningun parametro
(esta configurado en `pytest.ini` con el plugin `pytest-html`):

```bash
cd backend
.venv\Scripts\python -m pytest
```

Se crea en **`backend/reports/informe-tests.html`**. Abrelo con doble clic: es un archivo
autocontenido (`--self-contained-html`), lleva dentro el CSS y el JavaScript, asi que se
puede enviar por correo o entregar suelto y se ve igual.

El informe incluye:

- titulo, fecha y hora de la ejecucion;
- una tabla *Environment* con la version de Python, el sistema y tres datos propios
  (proyecto, capa y origen de los datos) definidos en `backend/conftest.py`;
- el resumen de resultados con filtros por estado (Failed / Passed / Skipped...);
- una fila por test con una columna **"Que comprueba"** que saca automaticamente el
  docstring de cada funcion de test;
- si algun test falla, su fila sale en rojo la primera y despliega el traceback completo.

### Que cubren los 7 tests

**Backend (`backend/tests/test_service.py`)** — usa un repositorio de productos, un repositorio
de movimientos y una `Config`, todos mockeados e inyectados desde `conftest.py`:

1. `test_resumen_global_y_por_categoria` — KPIs y el desglose ordenado que alimenta el grafico.
2. `test_listar_filtra_y_crear_valida_la_categoria` — filtros, calculo del IVA y alta validada contra `config.json`.
3. `test_movimientos_actualizan_el_stock_y_su_historial` — entrada, salida, rechazo por stock insuficiente y por motivo no valido.

**Frontend (`frontend/tests/`)** — datos mockeados en `tests/mocks.js`:

1. `inventario.test.js` — resumen, formato de moneda, filtros, ordenacion y escalado de las barras.
2. `router.test.js` — cada ventana resuelve su ruta; hash vacio o desconocido cae en el Resumen.
3. `api.test.js` — cliente HTTP con `global.fetch` reemplazado por `vi.fn()`: GET, POST y errores.
4. `auth.test.js` — login mockeado: credenciales validas e invalidas, la contrasena nunca sale en
   la sesion, y el ciclo guardar/leer/cerrar sesion con un `sessionStorage` falso.

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/config` | configuracion publica para el frontend |
| GET | `/api/productos` | lista; acepta `?categoria=` y `?solo_stock_bajo=true` |
| GET | `/api/productos/{id}` | un producto |
| POST | `/api/productos` | crea un producto (400 si la categoria no esta en el config) |
| DELETE | `/api/productos/{id}` | elimina un producto |
| GET | `/api/movimientos` | historial de entradas y salidas |
| POST | `/api/movimientos` | registra un movimiento (409 si no hay stock suficiente) |
| GET | `/api/resumen` | totales del inventario |
| GET | `/api/resumen/categorias` | valor, unidades y productos por categoria |

## Notas de diseño del grafico

El grafico del Resumen compara **magnitud** (valor por categoria), asi que usa **un solo tono azul**
en vez de un color por categoria: el nombre ya esta en el eje, un arcoiris no añadiria informacion.
Los colores (`--serie-1` y los cuatro estados) estan verificados con un validador de contraste
contra la superficie de los paneles, y los estados llevan siempre **icono + texto**, nunca solo color,
para que se entiendan sin distinguir colores. Debajo del grafico hay un desplegable
"Ver los datos como tabla" con las mismas cifras.
