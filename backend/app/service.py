"""Logica de negocio del inventario."""
from app.config import Config
from app.models import (
    Movimiento,
    MovimientoNuevo,
    Producto,
    ProductoDetalle,
    ProductoNuevo,
    Resumen,
    ResumenCategoria,
    TipoMovimiento,
)
from app.repository import RepositorioInventario, RepositorioMovimientos


class StockInsuficienteError(Exception):
    """Se intenta sacar mas unidades de las que hay en almacen."""


class InventarioService:
    def __init__(
        self,
        repositorio: RepositorioInventario,
        config: Config,
        movimientos: RepositorioMovimientos | None = None,
    ) -> None:
        self.repositorio = repositorio
        self.config = config
        self.movimientos = movimientos or RepositorioMovimientos([])

    # --- productos ---------------------------------------------------------
    def _detallar(self, producto: Producto) -> ProductoDetalle:
        valor_total = round(producto.cantidad * producto.precio, 2)
        return ProductoDetalle(
            **producto.model_dump(),
            valor_total=valor_total,
            valor_con_iva=round(valor_total * (1 + self.config.iva), 2),
            stock_bajo=producto.cantidad < self.config.stock_minimo,
        )

    def listar(self, categoria: str | None = None, solo_stock_bajo: bool = False) -> list[ProductoDetalle]:
        detalles = [self._detallar(p) for p in self.repositorio.listar()]
        if categoria:
            detalles = [d for d in detalles if d.categoria.lower() == categoria.lower()]
        if solo_stock_bajo:
            detalles = [d for d in detalles if d.stock_bajo]
        return detalles

    def obtener(self, producto_id: int) -> ProductoDetalle | None:
        producto = self.repositorio.obtener(producto_id)
        return self._detallar(producto) if producto else None

    def crear(self, nuevo: ProductoNuevo) -> ProductoDetalle:
        if nuevo.categoria not in self.config.categorias:
            raise ValueError(f"Categoria no valida: {nuevo.categoria}")
        return self._detallar(self.repositorio.crear(nuevo))

    def eliminar(self, producto_id: int) -> bool:
        return self.repositorio.eliminar(producto_id)

    # --- movimientos -------------------------------------------------------
    def listar_movimientos(self) -> list[Movimiento]:
        return self.movimientos.listar()

    def registrar_movimiento(self, nuevo: MovimientoNuevo) -> Movimiento:
        """Aplica una entrada o salida y deja constancia en el historial."""
        producto = self.repositorio.obtener(nuevo.producto_id)
        if producto is None:
            raise ValueError(f"Producto no encontrado: {nuevo.producto_id}")
        if nuevo.motivo not in self.config.motivos_movimiento:
            raise ValueError(f"Motivo no valido: {nuevo.motivo}")

        if nuevo.tipo is TipoMovimiento.ENTRADA:
            cantidad_resultante = producto.cantidad + nuevo.cantidad
        else:
            if nuevo.cantidad > producto.cantidad:
                raise StockInsuficienteError(
                    f"Stock insuficiente de '{producto.nombre}': hay {producto.cantidad}, "
                    f"se piden {nuevo.cantidad}"
                )
            cantidad_resultante = producto.cantidad - nuevo.cantidad

        self.repositorio.actualizar_cantidad(producto.id, cantidad_resultante)
        return self.movimientos.registrar(nuevo, producto.nombre, cantidad_resultante)

    # --- resumenes ---------------------------------------------------------
    def resumen(self) -> Resumen:
        detalles = self.listar()
        return Resumen(
            total_productos=len(detalles),
            unidades=sum(d.cantidad for d in detalles),
            valor_inventario=round(sum(d.valor_total for d in detalles), 2),
            productos_stock_bajo=sum(1 for d in detalles if d.stock_bajo),
            moneda=self.config.moneda,
        )

    def resumen_por_categoria(self) -> list[ResumenCategoria]:
        """Agrupa el inventario por categoria, de mayor a menor valor."""
        detalles = self.listar()
        agrupado: dict[str, ResumenCategoria] = {}
        for d in detalles:
            actual = agrupado.get(d.categoria)
            if actual is None:
                agrupado[d.categoria] = ResumenCategoria(
                    categoria=d.categoria, productos=1, unidades=d.cantidad, valor=d.valor_total
                )
            else:
                agrupado[d.categoria] = ResumenCategoria(
                    categoria=d.categoria,
                    productos=actual.productos + 1,
                    unidades=actual.unidades + d.cantidad,
                    valor=round(actual.valor + d.valor_total, 2),
                )
        return sorted(agrupado.values(), key=lambda r: r.valor, reverse=True)
