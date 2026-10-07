"""Repositorios en memoria con datos MOCKEADOS (no hay base de datos real)."""
from datetime import datetime

from app.models import Movimiento, MovimientoNuevo, Producto, ProductoNuevo

# Datos mockeados que simulan lo que devolveria una base de datos.
DATOS_MOCK: list[dict] = [
    {"id": 1, "nombre": "Portatil Lenovo X1", "categoria": "Portatiles", "cantidad": 7, "precio": 1299.00},
    {"id": 2, "nombre": "Teclado mecanico K2", "categoria": "Perifericos", "cantidad": 3, "precio": 89.90},
    {"id": 3, "nombre": "Monitor 27 4K", "categoria": "Monitores", "cantidad": 12, "precio": 349.50},
    {"id": 4, "nombre": "Raton inalambrico MX", "categoria": "Perifericos", "cantidad": 2, "precio": 59.99},
    {"id": 5, "nombre": "Switch 8 puertos", "categoria": "Redes", "cantidad": 15, "precio": 42.00},
    {"id": 6, "nombre": "Portatil MacBook Air", "categoria": "Portatiles", "cantidad": 4, "precio": 1199.00},
]

# Historial mockeado de entradas y salidas de almacen.
MOVIMIENTOS_MOCK: list[dict] = [
    {"id": 1, "producto_id": 3, "producto_nombre": "Monitor 27 4K", "tipo": "entrada",
     "cantidad": 10, "motivo": "Compra", "fecha": "2026-09-28 09:15", "cantidad_resultante": 12},
    {"id": 2, "producto_id": 4, "producto_nombre": "Raton inalambrico MX", "tipo": "salida",
     "cantidad": 6, "motivo": "Venta", "fecha": "2026-09-30 17:40", "cantidad_resultante": 2},
    {"id": 3, "producto_id": 1, "producto_nombre": "Portatil Lenovo X1", "tipo": "salida",
     "cantidad": 2, "motivo": "Venta", "fecha": "2026-10-02 11:05", "cantidad_resultante": 7},
    {"id": 4, "producto_id": 2, "producto_nombre": "Teclado mecanico K2", "tipo": "salida",
     "cantidad": 1, "motivo": "Rotura", "fecha": "2026-10-05 13:22", "cantidad_resultante": 3},
]


class RepositorioInventario:
    """Acceso a los productos. En un proyecto real hablaria con una BD."""

    def __init__(self, datos: list[dict] | None = None) -> None:
        origen = datos if datos is not None else DATOS_MOCK
        self._productos: list[Producto] = [Producto(**d) for d in origen]

    def listar(self) -> list[Producto]:
        return list(self._productos)

    def obtener(self, producto_id: int) -> Producto | None:
        return next((p for p in self._productos if p.id == producto_id), None)

    def crear(self, nuevo: ProductoNuevo) -> Producto:
        siguiente_id = max((p.id for p in self._productos), default=0) + 1
        producto = Producto(id=siguiente_id, **nuevo.model_dump())
        self._productos.append(producto)
        return producto

    def actualizar_cantidad(self, producto_id: int, cantidad: int) -> Producto | None:
        producto = self.obtener(producto_id)
        if producto is None:
            return None
        actualizado = producto.model_copy(update={"cantidad": cantidad})
        self._productos[self._productos.index(producto)] = actualizado
        return actualizado

    def eliminar(self, producto_id: int) -> bool:
        producto = self.obtener(producto_id)
        if producto is None:
            return False
        self._productos.remove(producto)
        return True


class RepositorioMovimientos:
    """Historial de entradas y salidas, tambien mockeado en memoria."""

    def __init__(self, datos: list[dict] | None = None) -> None:
        origen = datos if datos is not None else MOVIMIENTOS_MOCK
        self._movimientos: list[Movimiento] = [Movimiento(**d) for d in origen]

    def listar(self) -> list[Movimiento]:
        """Mas recientes primero."""
        return sorted(self._movimientos, key=lambda m: m.fecha, reverse=True)

    def registrar(self, nuevo: MovimientoNuevo, producto_nombre: str, cantidad_resultante: int) -> Movimiento:
        siguiente_id = max((m.id for m in self._movimientos), default=0) + 1
        movimiento = Movimiento(
            id=siguiente_id,
            producto_nombre=producto_nombre,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M"),
            cantidad_resultante=cantidad_resultante,
            **nuevo.model_dump(),
        )
        self._movimientos.append(movimiento)
        return movimiento
