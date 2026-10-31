
function mostrarReportes() {
    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

    const filtro = document.getElementById("filtroPeriodoReporte");
    const periodo = filtro ? filtro.value : "7dias";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - 6);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ventasFiltradas = ventas.filter(function (venta) {
        const fechaVenta = new Date(venta.fecha);

        if (Number.isNaN(fechaVenta.getTime())) {
            return false;
        }

        if (periodo === "hoy") {
            return fechaVenta >= hoy;
        }

        if (periodo === "7dias") {
            return fechaVenta >= inicioSemana && fechaVenta < new Date(
                hoy.getFullYear(),
                hoy.getMonth(),
                hoy.getDate() + 1
            );
        }

        if (periodo === "mes") {
            return fechaVenta >= inicioMes;
        }

        return true;
    });

    const ingresos = ventasFiltradas.reduce(function (total, venta) {
        return total + (Number(venta.total) || 0);
    }, 0);

    const cantidadVentas = ventasFiltradas.length;

    const ticketPromedio = cantidadVentas > 0
        ? ingresos / cantidadVentas
        : 0;

    const unidadesVendidas = ventasFiltradas.reduce(function (total, venta) {
        const productosVenta = Array.isArray(venta.productos)
            ? venta.productos
            : [];

        return total + productosVenta.reduce(function (subtotal, producto) {
            return subtotal + (Number(producto.cantidad) || 0);
        }, 0);
    }, 0);

    const formatoPesos = function (importe) {
        return "$" + importe.toLocaleString("es-AR", {
            maximumFractionDigits: 2
        });
    };

    document.getElementById("reporteIngresos").textContent =
        formatoPesos(ingresos);

    document.getElementById("reporteCantidadVentas").textContent =
        cantidadVentas;

    document.getElementById("reporteTicketPromedio").textContent =
        formatoPesos(ticketPromedio);

    document.getElementById("reporteUnidadesVendidas").textContent =
        unidadesVendidas;

    const tabla = document.getElementById("tablaReportes");

    if (!tabla) return;

    if (ventasFiltradas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No hay ventas registradas para este período.
                </td>
            </tr>
        `;
        return;
    }

    const ventasOrdenadas = [...ventasFiltradas].sort(function (a, b) {
        return new Date(b.fecha) - new Date(a.fecha);
    });

    tabla.innerHTML = ventasOrdenadas.map(function (venta) {
        const productosVenta = Array.isArray(venta.productos)
            ? venta.productos
            : [];

        const nombresProductos = productosVenta.map(function (producto) {
            return producto.nombre || "Producto";
        }).join(", ");

        const unidades = productosVenta.reduce(function (total, producto) {
            return total + (Number(producto.cantidad) || 0);
        }, 0);

        const fecha = new Date(venta.fecha).toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short"
        });

        return `
            <tr>
                <td>${venta.id}</td>
                <td>${fecha}</td>
                <td>${venta.cliente ? venta.cliente.nombre : "Venta sin cliente"}</td>
                <td>${nombresProductos}</td>
                <td>${unidades}</td>
                <td>${formatoPesos(Number(venta.total) || 0)}</td>
            </tr>
        `;
    }).join("");
}

const filtroPeriodoReporte = document.getElementById("filtroPeriodoReporte");

if (filtroPeriodoReporte) {
    filtroPeriodoReporte.addEventListener("change", mostrarReportes);
}



/* =========================
   EXPORTAR REPORTES A EXCEL
========================= */

async function exportarReportesExcel() {

    // Verificar que ExcelJS esté disponible
    if (typeof ExcelJS === "undefined") {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar la biblioteca de Excel."
        });
        return;
    }

    // Recuperar las ventas
    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

    // Obtener el período seleccionado
    const filtro = document.getElementById("filtroPeriodoReporte");
    const periodo = filtro ? filtro.value : "7dias";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - 6);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Aplicar el mismo filtro que utiliza Reportes
    const ventasFiltradas = ventas.filter(function (venta) {

        const fecha = new Date(venta.fecha);

        if (Number.isNaN(fecha.getTime())) return false;

        if (periodo === "hoy") {
            return fecha >= hoy;
        }

        if (periodo === "7dias") {
            const finHoy = new Date(hoy);
            finHoy.setDate(finHoy.getDate() + 1);

            return fecha >= inicioSemana && fecha < finHoy;
        }

        if (periodo === "mes") {
            return fecha >= inicioMes;
        }

        return true;
    });

    if (ventasFiltradas.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Sin ventas",
            text: "No hay ventas para exportar en este período."
        });
        return;
    }

    // Crear el libro de Excel
    const libro = new ExcelJS.Workbook();

    libro.creator = "Dulce Trigo";
    libro.created = new Date();

    const hoja = libro.addWorksheet("Reporte de ventas");

    // Título
    hoja.mergeCells("A1:F1");
    hoja.getCell("A1").value = "DULCE TRIGO - REPORTE DE VENTAS";
    hoja.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" }
    };
    hoja.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8A5A3B" }
    };
    hoja.getCell("A1").alignment = {
        horizontal: "center"
    };

    // Encabezados
    hoja.addRow([]);
    hoja.addRow([
        "N.º de venta",
        "Fecha",
        "Cliente",
        "Productos",
        "Unidades",
        "Total"
    ]);

    const filaEncabezado = hoja.getRow(3);

    filaEncabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
    filaEncabezado.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8A5A3B" }
    };

    // Agregar las ventas
    ventasFiltradas.forEach(function (venta) {

        const productosVenta = Array.isArray(venta.productos)
            ? venta.productos
            : [];

        const nombres = productosVenta.map(function (producto) {
            return producto.nombre || "Producto";
        }).join(", ");

        const unidades = productosVenta.reduce(function (total, producto) {
            return total + (Number(producto.cantidad) || 0);
        }, 0);

        hoja.addRow([
            venta.id,
            new Date(venta.fecha),
            venta.cliente ? venta.cliente.nombre : "Venta sin cliente",
            nombres,
            unidades,
            Number(venta.total) || 0
        ]);
    });

    // Formato de fechas y moneda
    hoja.getColumn(2).numFmt = "dd/mm/yyyy hh:mm";
    hoja.getColumn(6).numFmt = '"$" #,##0.00';

    // Ajustar el ancho de las columnas
    hoja.columns = [
        { width: 18 },
        { width: 22 },
        { width: 25 },
        { width: 40 },
        { width: 15 },
        { width: 18 }
    ];

    // Descargar el archivo
    const archivo = await libro.xlsx.writeBuffer();

    const blob = new Blob(
        [archivo],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "Reporte_Dulce_Trigo.xlsx";

    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);

    Swal.fire({
        icon: "success",
        title: "¡Reporte exportado!",
        text: "Tu archivo Excel se descargó correctamente.",
        confirmButtonColor: "#8a5a3b"
    });
}

// Conectar el botón
const btnExportarExcel = document.getElementById("btnExportarExcel");

if (btnExportarExcel) {
    btnExportarExcel.addEventListener("click", exportarReportesExcel);
}

