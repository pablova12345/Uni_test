"""3 unit tests del backend sobre InventarioService con datos mockeados."""
import pytest

from app.models import MovimientoNuevo, ProductoNuevo, TipoMovimiento
from app.service import InventarioService, StockInsuficienteError


def test_resumen_global_y_por_categoria(servicio: InventarioService):
    """Test 1: los datos que alimentan la vista Resumen (KPIs y desglose)."""
    resumen = servicio.resumen()
    assert resumen.total_productos == 4
    assert resumen.unidades == 25                  
    assert resumen.valor_inventario == 11350.00   
    assert resumen.productos_stock_bajo == 2       
    assert resumen.moneda == "Bs"

    categorias = servicio.resumen_por_categoria()
    assert [c.categoria for c in categorias] == ["Portatiles", "Monitores", "Perifericos"]
    assert categorias[0].valor == 10000.00          # ordenado de mayor a menor valor
    perifericos = next(c for c in categorias if c.categoria == "Perifericos")
    assert (perifericos.productos, perifericos.unidades, perifericos.valor) == (2, 8, 550.00)


def test_listar_filtra_y_crear_valida_la_categoria(servicio: InventarioService):
    """Test 2: los datos de la vista Productos (filtros, IVA y alta)."""
    perifericos = servicio.listar(categoria="perifericos")
    assert [p.nombre for p in perifericos] == ["Raton Test", "Teclado Test"]
    assert perifericos[0].stock_bajo is True
    assert perifericos[0].valor_total == 100.00
    assert perifericos[0].valor_con_iva == 121.00   # IVA del 21% del config
    assert perifericos[1].stock_bajo is False

    assert [p.id for p in servicio.listar(solo_stock_bajo=True)] == [2, 3]

    creado = servicio.crear(ProductoNuevo(nombre="Cable HDMI", categoria="Redes", cantidad=1, precio=10.0))
    assert creado.id == 5
    with pytest.raises(ValueError, match="Categoria no valida"):
        servicio.crear(ProductoNuevo(nombre="Silla", categoria="Mobiliario", cantidad=3, precio=99.0))
    assert len(servicio.listar()) == 5               # el invalido no se guarda


def test_movimientos_actualizan_el_stock_y_su_historial(servicio: InventarioService):
    """Test 3: los datos de la vista Movimientos entrada, salida y validaciones."""
    entrada = servicio.registrar_movimiento(
        MovimientoNuevo(producto_id=2, tipo=TipoMovimiento.ENTRADA, cantidad=8, motivo="Compra")
    )
    assert entrada.cantidad_resultante == 10         # 2 + 8
    assert servicio.obtener(2).stock_bajo is False   # ya supera el stock_minimo

    salida = servicio.registrar_movimiento(
        MovimientoNuevo(producto_id=1, tipo=TipoMovimiento.SALIDA, cantidad=4, motivo="Venta")
    )
    assert salida.cantidad_resultante == 6           # 10 - 4
    assert salida.producto_nombre == "Portatil Test"

    # Una salida mayor que el stock se rechaza y no altera nada.
    with pytest.raises(StockInsuficienteError, match="Stock insuficiente"):
        servicio.registrar_movimiento(
            MovimientoNuevo(producto_id=3, tipo=TipoMovimiento.SALIDA, cantidad=99, motivo="Venta")
        )
    assert servicio.obtener(3).cantidad == 4

    # El motivo tiene que estar en el archivo de configuracion.
    with pytest.raises(ValueError, match="Motivo no valido"):
        servicio.registrar_movimiento(
            MovimientoNuevo(producto_id=1, tipo=TipoMovimiento.ENTRADA, cantidad=1, motivo="Regalo")
        )

    historial = servicio.listar_movimientos()
    assert len(historial) == 3                       # 1 mockeado + 2 registrados
    assert historial[0].fecha >= historial[-1].fecha  # mas recientes primero
