"""Carga de la configuracion del proyecto desde config.json."""
import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

RUTA_CONFIG = Path(__file__).resolve().parents[2] / "config.json"


@dataclass(frozen=True)
class Config:
    nombre: str
    version: str
    entorno: str
    host: str
    puerto: int
    origenes_permitidos: list[str]
    moneda: str
    stock_minimo: int
    iva: float
    categorias: list[str]
    motivos_movimiento: list[str]

    @classmethod
    def desde_dict(cls, datos: dict) -> "Config":
        app = datos["app"]
        servidor = datos["servidor"]
        inventario = datos["inventario"]
        return cls(
            nombre=app["nombre"],
            version=app["version"],
            entorno=app["entorno"],
            host=servidor["host"],
            puerto=int(servidor["puerto"]),
            origenes_permitidos=list(servidor["origenes_permitidos"]),
            moneda=inventario["moneda"],
            stock_minimo=int(inventario["stock_minimo"]),
            iva=float(inventario["iva"]),
            categorias=list(inventario["categorias"]),
            motivos_movimiento=list(inventario["motivos_movimiento"]),
        )


def cargar_config(ruta: Path | None = None) -> Config:
    """Lee el fichero de configuracion y devuelve un objeto Config."""
    ruta = ruta or RUTA_CONFIG
    if not ruta.exists():
        raise FileNotFoundError(f"No se encuentra el archivo de configuracion: {ruta}")
    with ruta.open(encoding="utf-8") as fichero:
        return Config.desde_dict(json.load(fichero))


@lru_cache(maxsize=1)
def obtener_config() -> Config:
    """Version cacheada para usar como dependencia de FastAPI."""
    return cargar_config()
