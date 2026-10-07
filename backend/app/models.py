"""Modelos de datos del inventario."""
from enum import Enum

from pydantic import BaseModel, Field


class Producto(BaseModel):
    id: int
    nombre: str
    categoria: str
    cantidad: int = Field(ge=0)
    precio: float = Field(ge=0)


class ProductoNuevo(BaseModel):
    nombre: str = Field(min_length=1)
    categoria: str
    cantidad: int = Field(ge=0)
    precio: float = Field(ge=0)


class ProductoDetalle(Producto):
    """Producto enriquecido con los calculos del servicio."""
    valor_total: float
    valor_con_iva: float
    stock_bajo: bool


class TipoMovimiento(str, Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"


class MovimientoNuevo(BaseModel):
    producto_id: int
    tipo: TipoMovimiento
    cantidad: int = Field(gt=0)
    motivo: str


class Movimiento(MovimientoNuevo):
    id: int
    producto_nombre: str
    fecha: str
    cantidad_resultante: int


class Resumen(BaseModel):
    total_productos: int
    unidades: int
    valor_inventario: float
    productos_stock_bajo: int
    moneda: str


class ResumenCategoria(BaseModel):
    categoria: str
    productos: int
    unidades: int
    valor: float
