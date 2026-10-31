
/* =========================
   MÓDULO DE VENTAS
========================= */

// Carrito temporal de la venta
let carritoVenta = [];

// Mostrar productos disponibles para vender
function mostrarProductosVenta(lista = productos) {

    const contenedor = document.getElementById("listaProductosVenta");

    if (!contenedor) return;

    // Mostrar solamente productos activos
    const productosDisponibles = lista.filter(function (producto) {
        return producto.activo !== false;
    });

    if (productosDisponibles.length === 0) {
        contenedor.innerHTML = `
            <p>No hay productos disponibles para vender.</p>
        `;
        return;
    }

    contenedor.innerHTML = productosDisponibles.map(function (producto) {

        return `
            <article class="producto-venta">
                <div>
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${Number(producto.precio).toLocaleString("es-AR")}</p>
                    <p>Stock disponible: ${producto.stock}</p>
                </div>

                <button
                    type="button"
                    onclick="agregarProductoVenta(${producto.id})"
                    ${Number(producto.stock) <= 0 ? "disabled" : ""}
                >
                    ${Number(producto.stock) <= 0 ? "Sin stock" : "Agregar"}
                </button>
            </article>
        `;

    }).join("");
}

// Agregar un producto al carrito
function agregarProductoVenta(id) {

    const producto = productos.find(function (item) {
        return item.id === id && item.activo !== false;
    });

    if (!producto) return;

    if (Number(producto.stock) <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Sin stock",
            text: "Este producto no tiene unidades disponibles."
        });
        return;
    }

    const productoEnCarrito = carritoVenta.find(function (item) {
        return item.id === id;
    });

    if (productoEnCarrito) {

        if (productoEnCarrito.cantidad >= Number(producto.stock)) {
            Swal.fire({
                icon: "warning",
                title: "Stock insuficiente",
                text: "No podés agregar más unidades de este producto."
            });
            return;
        }

        productoEnCarrito.cantidad++;

    } else {

        carritoVenta.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: 1
        });

    }

    mostrarDetalleVenta();
}

// Mostrar el detalle y calcular el total
function mostrarDetalleVenta() {

    const detalle = document.getElementById("detalleVenta");
    const totalElemento = document.getElementById("totalVenta");
    const botonConfirmar = document.getElementById("btnConfirmarVenta");

    if (!detalle || !totalElemento || !botonConfirmar) return;

    if (carritoVenta.length === 0) {
        detalle.innerHTML = "<p>Agregá productos para comenzar.</p>";
        totalElemento.textContent = "$0";
        botonConfirmar.disabled = true;
        return;
    }

    detalle.innerHTML = carritoVenta.map(function (item) {

        return `
            <div class="detalle-producto">
                <span>${item.nombre}</span>
                <span>${item.cantidad} × $${item.precio.toLocaleString("es-AR")}</span>
                <strong>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</strong>

                <button
                    type="button"
                    onclick="quitarProductoVenta(${item.id})"
                >
                    Quitar
                </button>
            </div>
        `;

    }).join("");

    const total = carritoVenta.reduce(function (acumulado, item) {
        return acumulado + item.precio * item.cantidad;
    }, 0);

    totalElemento.textContent = "$" + total.toLocaleString("es-AR");
    botonConfirmar.disabled = false;
}

// Quitar un producto del carrito
function quitarProductoVenta(id) {

    carritoVenta = carritoVenta.filter(function (item) {
        return item.id !== id;
    });

    mostrarDetalleVenta();
}

// Inicializar el módulo
mostrarProductosVenta();


/* =========================
   CONFIRMAR Y REGISTRAR VENTA
========================= */

document.getElementById("btnConfirmarVenta")
    .addEventListener("click", function () {

        if (carritoVenta.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Carrito vacío",
                text: "Agregá al menos un producto."
            });
            return;
        }

        // Verificar nuevamente el stock antes de vender
        for (const item of carritoVenta) {

            const producto = productos.find(function (p) {
                return p.id === item.id && p.activo !== false;
            });

            if (!producto || Number(producto.stock) < item.cantidad) {
                Swal.fire({
                    icon: "error",
                    title: "Stock insuficiente",
                    text: `No hay stock suficiente de ${item.nombre}.`
                });
                mostrarProductosVenta();
                return;
            }
        }

        // Descontar las unidades vendidas
        carritoVenta.forEach(function (item) {

            const producto = productos.find(function (p) {
                return p.id === item.id;
            });

            producto.stock = Number(producto.stock) - item.cantidad;
        });

        // Calcular el total
        const total = carritoVenta.reduce(function (acumulado, item) {
            return acumulado + item.precio * item.cantidad;
        }, 0);

        // Recuperar el historial de ventas
        const ventasGuardadas = JSON.parse(
            localStorage.getItem("ventas")
        ) || [];

        // Crear el registro de la venta
        // Recuperar el cliente seleccionado
        const selectorCliente = document.getElementById("clienteVenta");
        const idClienteSeleccionado = selectorCliente.value;

        const clienteSeleccionado = clientes.find(function (cliente) {
            return cliente.id === Number(idClienteSeleccionado) &&
                cliente.activo !== false;
        });

        // Crear el registro de la venta
        const nuevaVenta = {
            id: Date.now(),
            fecha: new Date().toISOString(),

            cliente: clienteSeleccionado
                ? {
                    id: clienteSeleccionado.id,
                    nombre: clienteSeleccionado.nombre
                }
                : null,

            productos: carritoVenta.map(function (item) {
                return {
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad,
                    subtotal: item.precio * item.cantidad
                };
            }),

            total: total
        };

        ventasGuardadas.push(nuevaVenta);

        // Guardar productos actualizados e historial
        localStorage.setItem("productos", JSON.stringify(productos));
        localStorage.setItem("ventas", JSON.stringify(ventasGuardadas));

        // Actualizar la pantalla
        mostrarProductos(productos);
        mostrarProductosVenta();
        actualizarDashboard();
        mostrarReportes();

        // Vaciar el carrito
        carritoVenta = [];
        mostrarDetalleVenta();

        // Confirmar la operación
        Swal.fire({
            icon: "success",
            title: "¡Venta registrada!",
            text: `Total de la venta: $${total.toLocaleString("es-AR")}`,
            confirmButtonColor: "#8a5a3b"
        });
    });


/* =========================
   BUSCADOR DE PRODUCTOS EN VENTAS
========================= */

const buscadorVenta = document.getElementById("buscarProductoVenta");

if (buscadorVenta) {
    buscadorVenta.addEventListener("input", function () {
        const texto = this.value.trim().toLowerCase();

        const productosFiltrados = productos.filter(function (producto) {
            return (
                producto.activo !== false &&
                producto.nombre.toLowerCase().includes(texto)
            );
        });

        mostrarProductosVenta(productosFiltrados);
    });
}