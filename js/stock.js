
/* =========================
   MÓDULO DE STOCK
========================= */

// Obtener los elementos de la sección
const tablaStock = document.getElementById("tablaStock");
const buscarProductoStock = document.getElementById("buscarProductoStock");
const filtroEstadoStock = document.getElementById("filtroEstadoStock");

// Mostrar el inventario
function mostrarStock() {

    if (!tablaStock) return;

    // Obtener productos activos
    const productosActivos = productos.filter(function (producto) {
        return producto.activo !== false;
    });

    // Actualizar las tarjetas de estadísticas
    document.getElementById("stockTotalProductos").textContent =
        productosActivos.length;

    document.getElementById("stockTotalUnidades").textContent =
        productosActivos.reduce(function (total, producto) {
            return total + Math.max(0, Number(producto.stock) || 0);
        }, 0);

    document.getElementById("stockTotalBajo").textContent =
        productosActivos.filter(function (producto) {
            const stock = Number(producto.stock) || 0;
            const minimo = Number(producto.stockMinimo) || 5;

            return stock > 0 && stock <= minimo;
        }).length;

    document.getElementById("stockTotalAgotado").textContent =
        productosActivos.filter(function (producto) {
            return Number(producto.stock) <= 0;
        }).length;

    // Aplicar búsqueda y filtro
    const texto = buscarProductoStock
        ? buscarProductoStock.value.trim().toLowerCase()
        : "";

    const estadoSeleccionado = filtroEstadoStock
        ? filtroEstadoStock.value
        : "todos";

    const productosFiltrados = productosActivos.filter(function (producto) {

        const nombre = producto.nombre.toLowerCase();
        const coincideNombre = nombre.includes(texto);

        const stock = Number(producto.stock) || 0;
        const minimo = Number(producto.stockMinimo) || 5;

        let estado = "disponible";

        if (stock <= 0) {
            estado = "agotado";
        } else if (stock <= minimo) {
            estado = "bajo";
        }

        const coincideEstado =
            estadoSeleccionado === "todos" ||
            estado === estadoSeleccionado;

        return coincideNombre && coincideEstado;
    });

    // Mostrar mensaje si no hay resultados
    if (productosFiltrados.length === 0) {
        tablaStock.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No se encontraron productos.
                </td>
            </tr>
        `;
        return;
    }

    // Construir las filas de la tabla
    tablaStock.innerHTML = productosFiltrados.map(function (producto) {

        const stock = Number(producto.stock) || 0;
        const minimo = Number(producto.stockMinimo) || 5;

        let estadoTexto = "Disponible";
        let claseEstado = "stock-disponible";

        if (stock <= 0) {
            estadoTexto = "Agotado";
            claseEstado = "stock-agotado";
        } else if (stock <= minimo) {
            estadoTexto = "Stock bajo";
            claseEstado = "stock-bajo";
        }

        const categoria = {
            panaderia: "Panadería",
            tortas: "Tortas",
            facturas: "Facturas",
            bebidas: "Bebidas"
        };

        return `
            <tr>
                <td>${producto.nombre}</td>
                <td>${categoria[producto.categoria] || producto.categoria}</td>
                <td>${stock}</td>
                <td>${minimo}</td>
                <td>
                    <span class="estado-stock ${claseEstado}">
                        ${estadoTexto}
                    </span>
                </td>
                <td>
                    <button
                        type="button"
                        class="btn-reponer-stock"
                        onclick="reponerStock(${producto.id})"
                    >
                        + Reponer
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}

// Escuchar los cambios del buscador
if (buscarProductoStock) {
    buscarProductoStock.addEventListener("input", mostrarStock);
}

// Escuchar los cambios del filtro
if (filtroEstadoStock) {
    filtroEstadoStock.addEventListener("change", mostrarStock);
}

// Primera carga
mostrarStock();