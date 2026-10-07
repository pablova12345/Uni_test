"""Configuracion del informe HTML de pytest (pytest-html).

Vive en la raiz del backend para no mezclarse con las fixtures de los tests,
que estan en tests/conftest.py.
"""
import pytest


def pytest_html_report_title(report):
    report.title = "Gestor de Inventario - Informe de tests del backend"


def pytest_metadata(metadata):
    """Datos que aparecen en la cabecera del informe."""
    metadata["Proyecto"] = "Gestor de Inventario"
    metadata["Capa"] = "Backend (FastAPI + pytest)"
    metadata["Origen de datos"] = "Mockeado en memoria (sin base de datos)"
    # Quita entradas del entorno que no aportan nada en una presentacion.
    for clave in ("JAVA_HOME", "Plugins", "Packages"):
        metadata.pop(clave, None)


@pytest.hookimpl(wrapper=True)
def pytest_runtest_makereport(item, call):
    """Guarda el docstring de cada test para mostrarlo como descripcion."""
    report = yield
    report.description = (item.function.__doc__ or "").strip()
    return report


def pytest_html_results_table_header(cells):
    cells.insert(2, "<th>Que comprueba</th>")


def pytest_html_results_table_row(report, cells):
    cells.insert(2, f"<td>{getattr(report, 'description', '')}</td>")
