"""Fixtures compartidas: config y datos totalmente mockeados."""
import pytest

from app.config import Config
from app.repository import RepositorioInventario, RepositorioMovimientos
from app.service import InventarioService

PRODUCTOS_MOCK = [
    {"id": 1, "nombre": "Portatil Test", "categoria": "Portatiles", "cantidad": 10, "precio": 1000.00},
    {"id": 2, "nombre": "Raton Test", "categoria": "Perifericos", "cantidad": 2, "precio": 50.00},
    {"id": 3, "nombre": "Monitor Test", "categoria": "Monitores", "cantidad": 4, "precio": 200.00},
    {"id": 4, "nombre": "Teclado Test", "categoria": "Perifericos", "cantidad": 6, "precio": 75.00},
]

MOVIMIENTOS_MOCK = [
    {"id": 1, "producto_id": 1, "producto_nombre": "Portatil Test", "tipo": "entrada",
     "cantidad": 10, "motivo": "Compra", "fecha": "2026-10-01 10:00", "cantidad_resultante": 10},
]


@pytest.fixture
def config_mock() -> Config:
    return Config(
        nombre="Gestor de Inventario (test)",
        version="0.0.0-test",
        entorno="test",
        host="127.0.0.1",
        puerto=8000,
        origenes_permitidos=["http://localhost:5173"],
        moneda="Bs",
        stock_minimo=5,
        iva=0.21,
        categorias=["Portatiles", "Perifericos", "Monitores", "Redes"],
        motivos_movimiento=["Compra", "Venta", "Devolucion", "Ajuste de inventario", "Rotura"],
    )


@pytest.fixture
def servicio(config_mock: Config) -> InventarioService:
    return InventarioService(
        RepositorioInventario(PRODUCTOS_MOCK),
        config_mock,
        RepositorioMovimientos(MOVIMIENTOS_MOCK),
    )
