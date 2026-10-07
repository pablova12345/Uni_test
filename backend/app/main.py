"""API REST del Gestor de Inventario."""
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import Config, obtener_config
from app.models import (
    Movimiento,
    MovimientoNuevo,
    ProductoDetalle,
    ProductoNuevo,
    Resumen,
    ResumenCategoria,
)
from app.repository import RepositorioInventario, RepositorioMovimientos
from app.service import InventarioService, StockInsuficienteError

config = obtener_config()

app = FastAPI(title=config.nombre, version=config.version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.origenes_permitidos,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Repositorios unicos en memoria para toda la aplicacion.
_repositorio = RepositorioInventario()
_movimientos = RepositorioMovimientos()


def obtener_servicio(cfg: Config = Depends(obtener_config)) -> InventarioService:
    return InventarioService(_repositorio, cfg, _movimientos)


@app.get("/api/config")
def leer_config(cfg: Config = Depends(obtener_config)) -> dict:
    return {
        "nombre": cfg.nombre,
        "version": cfg.version,
        "entorno": cfg.entorno,
        "moneda": cfg.moneda,
        "stock_minimo": cfg.stock_minimo,
        "iva": cfg.iva,
        "categorias": cfg.categorias,
        "motivos_movimiento": cfg.motivos_movimiento,
    }


# --- productos ---------------------------------------------------------------
@app.get("/api/productos", response_model=list[ProductoDetalle])
def listar_productos(
    categoria: str | None = None,
    solo_stock_bajo: bool = False,
    servicio: InventarioService = Depends(obtener_servicio),
):
    return servicio.listar(categoria=categoria, solo_stock_bajo=solo_stock_bajo)


@app.get("/api/productos/{producto_id}", response_model=ProductoDetalle)
def obtener_producto(producto_id: int, servicio: InventarioService = Depends(obtener_servicio)):
    producto = servicio.obtener(producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@app.post("/api/productos", response_model=ProductoDetalle, status_code=201)
def crear_producto(nuevo: ProductoNuevo, servicio: InventarioService = Depends(obtener_servicio)):
    try:
        return servicio.crear(nuevo)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.delete("/api/productos/{producto_id}", status_code=204)
def eliminar_producto(producto_id: int, servicio: InventarioService = Depends(obtener_servicio)):
    if not servicio.eliminar(producto_id):
        raise HTTPException(status_code=404, detail="Producto no encontrado")


# --- movimientos -------------------------------------------------------------
@app.get("/api/movimientos", response_model=list[Movimiento])
def listar_movimientos(servicio: InventarioService = Depends(obtener_servicio)):
    return servicio.listar_movimientos()


@app.post("/api/movimientos", response_model=Movimiento, status_code=201)
def crear_movimiento(nuevo: MovimientoNuevo, servicio: InventarioService = Depends(obtener_servicio)):
    try:
        return servicio.registrar_movimiento(nuevo)
    except StockInsuficienteError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


# --- resumenes ---------------------------------------------------------------
@app.get("/api/resumen", response_model=Resumen)
def leer_resumen(servicio: InventarioService = Depends(obtener_servicio)):
    return servicio.resumen()


@app.get("/api/resumen/categorias", response_model=list[ResumenCategoria])
def leer_resumen_categorias(servicio: InventarioService = Depends(obtener_servicio)):
    return servicio.resumen_por_categoria()
