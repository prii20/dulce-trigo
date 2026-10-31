// =========================
// PRODUCTOS GUARDADOS
// =========================

const productosGuardados =
    JSON.parse(localStorage.getItem("productos")) || [];

const productosConStockBajo = productosGuardados.filter(function (producto) {
    return producto.stock <= producto.stockMinimo;
});

// =========================
// DATOS DEL DASHBOARD
// =========================

const datosDashboard = {
    ventasDia: 125000,
    totalProductos: productosGuardados.filter(function (producto) {
        return producto.activo !== false;
    }).length,

    stockDisponible: productosGuardados.reduce(function (total, producto) {
        if (producto.activo === false) {
            return total;
        }

        return total + Number(producto.stock);
    }, 0)
};


/* =========================
   MOSTRAR DATOS
========================= */

function actualizarDashboard() {

    // Recuperar productos guardados
    const productosActuales =
        JSON.parse(localStorage.getItem("productos")) || [];

    const productosActivos = productosActuales.filter(function (producto) {
        return producto.activo !== false;
    });

    // Calcular el stock total disponible
    const totalStock = productosActivos.reduce(function (total, producto) {
        return total + Number(producto.stock || 0);
    }, 0);

    // Recuperar las ventas registradas
    const ventasRegistradas =
        JSON.parse(localStorage.getItem("ventas")) || [];

    // Obtener las ventas de hoy
    const hoy = new Date();

    const ventasDelDia = ventasRegistradas.filter(function (venta) {
        const fechaVenta = new Date(venta.fecha);

        return (
            fechaVenta.getFullYear() === hoy.getFullYear() &&
            fechaVenta.getMonth() === hoy.getMonth() &&
            fechaVenta.getDate() === hoy.getDate()
        );
    });

    // Sumar el importe de las ventas del día
    const totalVentasDia = ventasDelDia.reduce(function (total, venta) {
        return total + Number(venta.total || 0);
    }, 0);

    // Actualizar las tarjetas del Dashboard
    document.getElementById("ventasDia").textContent =
        `$${totalVentasDia.toLocaleString("es-AR")}`;

    document.getElementById("totalProductos").textContent =
        productosActivos.length;

    document.getElementById("stockDisponible").textContent =
        totalStock;

    // Contar los productos activos con stock bajo
    const cantidadStockBajo = productosActivos.filter(function (producto) {
        return Number(producto.stock) <= Number(producto.stockMinimo);
    }).length;

    document.getElementById("productosStockBajo").textContent =
        cantidadStockBajo;

    // Actualizar la lista de productos con stock bajo
    actualizarListaStockBajo();
    actualizarActividadReciente();
    actualizarGraficoVentas();
}



/* =========================
   GRÁFICO DE VENTAS REALES
========================= */

const canvas = document.getElementById("graficoVentas");

// Obtener las ventas guardadas
function obtenerVentasRegistradas() {
    return JSON.parse(localStorage.getItem("ventas")) || [];
}

// Preparar los datos de los últimos siete días
function obtenerDatosGrafico() {

    const ventas = obtenerVentasRegistradas();
    const etiquetas = [];
    const importes = [];

    const hoy = new Date();

    // Recorrer los últimos siete días, incluyendo hoy
    for (let i = 6; i >= 0; i--) {

        const fecha = new Date(hoy);
        fecha.setHours(0, 0, 0, 0);
        fecha.setDate(fecha.getDate() - i);

        const diaSiguiente = new Date(fecha);
        diaSiguiente.setDate(diaSiguiente.getDate() + 1);

        // Nombre corto del día
        etiquetas.push(
            fecha.toLocaleDateString("es-AR", {
                weekday: "short"
            })
        );

        // Sumar las ventas realizadas durante ese día
        const totalDia = ventas.reduce(function (total, venta) {

            const fechaVenta = new Date(venta.fecha);

            if (fechaVenta >= fecha && fechaVenta < diaSiguiente) {
                return total + Number(venta.total || 0);
            }

            return total;

        }, 0);

        importes.push(totalDia);
    }

    return {
        etiquetas: etiquetas,
        importes: importes
    };
}

const datosGrafico = obtenerDatosGrafico();

const graficoVentas = new Chart(canvas, {

    type: "line",

    data: {
        labels: datosGrafico.etiquetas,

        datasets: [{
            label: "Ventas",
            data: datosGrafico.importes,

            borderColor: "#b97850",
            backgroundColor: "rgba(185, 120, 80, 0.12)",

            borderWidth: 3,
            pointBackgroundColor: "#b97850",
            pointBorderColor: "#fffaf5",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,

            tension: 0.4,
            fill: true
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(138, 90, 59, 0.10)"
                },
                ticks: {
                    color: "#806451"
                }
            },

            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#806451"
                }
            }
        }
    }
});

// Actualizar el gráfico con las ventas guardadas
function actualizarGraficoVentas() {

    const datosActualizados = obtenerDatosGrafico();

    graficoVentas.data.labels = datosActualizados.etiquetas;
    graficoVentas.data.datasets[0].data = datosActualizados.importes;

    graficoVentas.update();
   
}




const actividades = [
    {
        icono: "🛒",
        texto: "Venta realizada",
        detalle: "Venta #00125",
        tiempo: "hace 25 minutos"
    },
    {
        icono: "👤 ",
        texto: "Nuevo cliente",
        detalle: "Maria Gonzalez",
        tiempo: "hace 15 minutos"
    },
    {
        icono: " 🥐",
        texto: "Producto agregado",
        detalle: "Medialunas",
        tiempo: "hace 1 hora"
    }
];


/* =========================
   ACTIVIDAD RECIENTE
========================= */

function actualizarActividadReciente() {

    const listaActividad = document.getElementById("listaActividad");

    if (!listaActividad) return;

    // Recuperar las ventas guardadas
    const ventasRegistradas =
        JSON.parse(localStorage.getItem("ventas")) || [];

    // Mostrar un mensaje si todavía no hay ventas
    if (ventasRegistradas.length === 0) {
        listaActividad.innerHTML = `
            <p class="sin-productos">
                Todavía no hay ventas registradas.
            </p>
        `;
        return;
    }

    // Ordenar las ventas desde la más reciente
    const ventasRecientes = [...ventasRegistradas]
        .sort(function (a, b) {
            return new Date(b.fecha) - new Date(a.fecha);
        })
        .slice(0, 5);

    listaActividad.innerHTML = ventasRecientes.map(function (venta) {

        const fechaVenta = new Date(venta.fecha);

        const fechaFormateada = fechaVenta.toLocaleDateString("es-AR");
        const horaFormateada = fechaVenta.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        const cantidadProductos = venta.productos.reduce(
            function (total, producto) {
                return total + Number(producto.cantidad || 0);
            },
            0
        );

        return `
            <div class="actividad-item">

                <div class="actividad-icono">
                    🛒
                </div>

                <div class="actividad-info">
                    <strong>Venta registrada #${venta.id}</strong>
                <span class="actividad-cliente">
                   ${venta.cliente ? venta.cliente.nombre : "Venta sin cliente"}
                </span>
                    <span>
                        ${cantidadProductos} unidades vendidas ·
                        $${Number(venta.total).toLocaleString("es-AR")}
                    </span>
                </div>

                <small>${fechaFormateada} ${horaFormateada}</small>

            </div>
        `;

    }).join("");
}

function actualizarListaStockBajo() {

    const listaStockBajo = document.getElementById("listaStockBajo");

    // Evitamos errores si el elemento no existe
    if (!listaStockBajo) return;

    const productosActuales =
        JSON.parse(localStorage.getItem("productos")) || [];

    // Buscamos productos activos con stock bajo
   const productosConStockBajo = productosActuales.filter(function (producto) {

    const stock = Number(producto.stock) || 0;
    const minimo = Number(producto.stockMinimo) || 5;

    return producto.activo !== false && stock <= minimo;
});

    // Limpiamos la lista anterior
    listaStockBajo.innerHTML = "";

  if (productosConStockBajo.length === 0) {
    listaStockBajo.innerHTML = `
        <div class="stock-sin-alertas">
            <div class="stock-sin-alertas-icono">
                <i class="bi bi-check-circle-fill"></i>
            </div>

            <div class="stock-sin-alertas-texto">
                <strong>¡Todo en orden!</strong>
                <p>No hay productos con stock bajo.</p>
                <span>Tu inventario está al día.</span>
            </div>
        </div>
    `;
    return;
}

    // Mostramos cada producto con stock bajo

    productosConStockBajo.forEach(function (producto) {

        const stockActual = Number(producto.stock);
        const stockMinimo = Number(producto.stockMinimo);

        // Calculamos cuántas unidades faltan para alcanzar el mínimo
        const unidadesFaltantes = Math.max(
            0,
            stockMinimo - stockActual
        );

        // Si no quedan unidades, la alerta será crítica
        const claseCritica = stockActual === 0 ? "stock-critico" : "";

        const mensajeAlerta = stockActual === 0
            ? "¡Sin stock! Necesita reposición urgente"
            : `Faltan ${unidadesFaltantes} unidades para alcanzar el mínimo`;

        const iconoAlerta = stockActual === 0 ? "🔴" : "⚠️";

        listaStockBajo.innerHTML += `
        <div class="stock-item ${claseCritica}">

            <div class="stock-icono">${iconoAlerta}</div>

            <div class="stock-info">
                <strong>${producto.nombre}</strong>

                <span>
                    Stock actual: ${stockActual} unidades
                </span>

                <span>
                    Stock mínimo: ${stockMinimo} unidades
                </span>

                <span class="texto-stock-bajo">
                    ${mensajeAlerta}
                </span>
            </div>

           
            <div class="stock-cantidad">
               ${stockActual === 0 ? "URGENTE" : `${unidadesFaltantes} por reponer`}
   
            <button
               type="button"
               class="btn-reponer-stock"
               onclick="reponerStock(${producto.id})">
              <span aria-hidden="true">＋</span>
              Reponer stock
           </button>
           </div>
        </div>
    `;
    });
}

// Mostrar las alertas al cargar la página
actualizarListaStockBajo();
// =========================
// BOTÓN DEL MENÚ
// =========================

const btnMenu = document.getElementById("btnMenu");

const sidebar = document.querySelector(".sidebar");


// Cuando hacemos click en el botón

btnMenu.addEventListener("click", function () {

    sidebar.classList.toggle("abierta");

});


/* =========================
   NAVEGACIÓN ENTRE SECCIONES
========================= */

const enlacesMenu = document.querySelectorAll(".menu-item");

const elementosInicio = [
    document.querySelector(".bienvenida"),
    document.querySelector(".estadisticas"),
    document.querySelector(".grafico-container"),
    document.querySelector(".dashboard-inferior")
];

const seccionProductos = document.querySelector(".productos-seccion");
const seccionVentas = document.getElementById("seccionVentas");
const seccionStock = document.getElementById("seccionStock");
const seccionReportes = document.getElementById("seccionReportes");
const seccionClientes = document.getElementById("seccionClientes");
// Secciones que se muestran desde el menú
const secciones = {
    productos: seccionProductos,
    ventas: seccionVentas,
    stock: seccionStock,
    reportes: seccionReportes,
    clientes: seccionClientes
};

enlacesMenu.forEach(function (enlace) {

    enlace.addEventListener("click", function (evento) {
        evento.preventDefault();

        const seccionSeleccionada = enlace.dataset.seccion;

        // Actualizar el menú activo
        enlacesMenu.forEach(function (item) {
            item.classList.remove("activo");
        });

        enlace.classList.add("activo");

        // Mostrar el Dashboard solamente al elegir Inicio
        elementosInicio.forEach(function (elemento) {
            elemento.hidden = seccionSeleccionada !== "inicio";
        });

        // Ocultar o mostrar las secciones
        Object.entries(secciones).forEach(function ([nombre, elemento]) {
            if (elemento) {
                elemento.hidden = nombre !== seccionSeleccionada;
            }
        });

        // Actualizar el inventario cada vez que entramos a Stock
        if (seccionSeleccionada === "stock") {
            mostrarStock();
        }
        // Actualizar el inventario cada vez que entramos a Stock
       if (seccionSeleccionada === "stock") {
           mostrarStock();
        }
    });
});

// Mostrar los datos al cargar la página
actualizarDashboard();