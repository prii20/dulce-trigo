
// =========================
// DATOS DE PRODUCTOS
// =========================

let productos = JSON.parse(localStorage.getItem("productos")) || [
    {
        id: 1,
        nombre: "Medialunas",
        categoria: "panaderia",
        precio: 2500,
        stock: 20
    },
    {
        id: 2,
        nombre: "Pan integral",
        categoria: "panaderia",
        precio: 1800,
        stock: 12
    },
    {
        id: 3,
        nombre: "Torta de chocolate",
        categoria: "tortas",
        precio: 8500,
        stock: 5
    },
    {
        id: 4,
        nombre: "Facturas surtidas",
        categoria: "facturas",
        precio: 3200,
        stock: 25
    },
    {
        id: 5,
        nombre: "Gaseosa",
        categoria: "bebidas",
        precio: 1800,
        stock: 8
    }
];
// =========================
// ESTADO DE LOS PRODUCTOS
// =========================

productos.forEach(function (producto) {

    if (producto.activo === undefined) {
        producto.activo = true;
    }
     if (producto.stockMinimo === undefined) {
        producto.stockMinimo = 5;
    }

});
localStorage.setItem(
    "productos",
    JSON.stringify(productos)
);

function nombreCategoria(categoria) {
    const categorias = {
        panaderia: "Panadería",
        tortas: "Tortas",
        facturas: "Facturas",
        bebidas: "Bebidas"
    };

    return categorias[categoria] || categoria;
}

// =========================
// MOSTRAR PRODUCTOS
// =========================

function mostrarProductos(lista) {

    tablaProductos.innerHTML = "";

    if (lista.length === 0) {

        tablaProductos.innerHTML = `
            <tr>
                <td colspan="6" class="sin-productos">
                    No hay productos para mostrar.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(function (producto) {

        tablaProductos.innerHTML += `
            <tr>
                <td>
                    <strong>${producto.nombre}</strong>
                </td>
                <td>
                    ${nombreCategoria(producto.categoria)}
                </td>
                <td>
                    $${producto.precio.toLocaleString("es-AR")}
                </td>
                <td>
                    ${
                      producto.stock <= producto.stockMinimo
                      ? `
                     <span class="stock-bajo">
                       ${producto.stock}
                    </span>
                    <small class="texto-stock-bajo">
                        ⚠️ Bajo
                    </small>
                  `
                : producto.stock
}
                </td>

                <td>
                    ${
                        producto.activo === false
                        ? '<span class="estado estado-inactivo">🔴 Inactivo</span>'
                        : '<span class="estado estado-activo">🟢 Activo</span>'
                    }
                </td>

                <td>

    ${producto.activo === false

                ? `
            <button
                class="btn-restaurar"
                onclick="restaurarProducto(${producto.id})">
                ↩️
            </button>
        `

                : `
            <button
                class="btn-editar"
                onclick="editarProducto(${producto.id})">
                ✏️
            </button>

            <button
                class="btn-eliminar"
                onclick="eliminarProducto(${producto.id})">
                🗑️
            </button>
        `
            }

</td>
            </tr>
        `;
    });
}


// Mostrar todos los productos al iniciar

mostrarProductos(productos);

// =========================
// FILTRAR PRODUCTOS
// =========================

const buscarProducto = document.getElementById("buscarProducto");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroEstado = document.getElementById("filtroEstado");
function filtrarProductos() {

    const texto = buscarProducto.value.toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;
    const estadoSeleccionado = filtroEstado.value;

    const resultados = productos.filter(function (producto) {

        const coincideNombre =
            producto.nombre.toLowerCase().includes(texto);

        const coincideCategoria =
            categoriaSeleccionada === "todos" ||
            producto.categoria === categoriaSeleccionada;

        let coincideEstado = true;

        if (estadoSeleccionado === "activos") {
            coincideEstado = producto.activo !== false;
        }

        if (estadoSeleccionado === "inactivos") {
            coincideEstado = producto.activo === false;
        }

        return coincideNombre &&
            coincideCategoria &&
            coincideEstado;
    });

    mostrarProductos(resultados);
}


// Cuando el usuario escribe
buscarProducto.addEventListener("input", filtrarProductos);

// Cuando cambia la categoría
filtroCategoria.addEventListener("change", filtrarProductos);
filtroEstado.addEventListener("change", filtrarProductos);

// =========================
// AGREGAR NUEVO PRODUCTO
// =========================

const formProducto = document.getElementById("formProducto");
let productoEditandoId = null;
const btnNuevoProducto = document.getElementById("btnNuevoProducto");

btnNuevoProducto.addEventListener("click", function () {

    // Volvemos a modo crear
    productoEditandoId = null;

    // Limpiamos el formulario
    formProducto.reset();

    // Cambiamos el título del modal
    document.getElementById("tituloModalProducto").textContent =
        "Nuevo producto";

});
formProducto.addEventListener("submit", function (evento) {

    // Evitamos que la página se recargue
    evento.preventDefault();

    // Obtenemos los valores del formulario
    const nombre = document.getElementById("nombreProducto").value;
    const categoria = document.getElementById("categoriaProducto").value;
    const precio = Number(document.getElementById("precioProducto").value);
    const stock = Number(document.getElementById("stockProducto").value);

    const stockMinimo = Number(
    document.getElementById("stockMinimoProducto").value
);
    // =========================
    // EDITAR PRODUCTO
    // =========================

    if (productoEditandoId !== null) {

        const producto = productos.find(function (producto) {
            return producto.id === productoEditandoId;
        });

        producto.nombre = nombre;
        producto.categoria = categoria;
        producto.precio = precio;
        producto.stock = stock;
        producto.stockMinimo = stockMinimo;


    }


    // =========================
    // CREAR PRODUCTO
    // =========================

    else {

        const nuevoProducto = {
            id: productos.length + 1,
            nombre: nombre,
            categoria: categoria,
            precio: precio,
            stock: stock,
            stockMinimo: stockMinimo,
            activo: true
           
        };

        productos.push(nuevoProducto);
    }


    // Guardamos los cambios
    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

    // actualizaer tarjetas del dashboard
    actualizarDashboard();
    // Actualizamos la tabla
    mostrarProductos(productos);


    // Limpiamos el formulario
    formProducto.reset();


    // Volvemos a modo "crear"
    productoEditandoId = null;


    // Cerramos el modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalProducto")
    );

    modal.hide();

});

// =========================
// EDITAR PRODUCTO
// =========================

window.editarProducto = function (id) {

    const producto = productos.find(function (producto) {
        return producto.id === id;
    });

    if (!producto) {
        return;
    }

    if (producto.activo === false) {
        return;
    }

    productoEditandoId = id;

    document.getElementById("tituloModalProducto").textContent =
        "Editar producto";

    document.getElementById("nombreProducto").value = producto.nombre;
    document.getElementById("categoriaProducto").value = producto.categoria;
    document.getElementById("precioProducto").value = producto.precio;
    document.getElementById("stockProducto").value = producto.stock;

    const modal = new bootstrap.Modal(
        document.getElementById("modalProducto")
    );

    modal.show();
};

// =========================
// ELIMINAR PRODUCTO
// =========================

window.eliminarProducto = function (id) {

    const producto = productos.find(function (producto) {
        return producto.id === id;
    });

    if (!producto) {
        return;
    }

    // Eliminación lógica
    producto.activo = false;

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );
    
    actualizarDashboard ();
    mostrarProductos(productos);
};

// =========================
// RESTAURAR PRODUCTO
// =========================

window.restaurarProducto = function (id) {

    const producto = productos.find(function (producto) {
        return producto.id === id;
    });

    if (!producto) {
        return;
    }

    producto.activo = true;

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );
    
    actualizarDashboard();
    mostrarProductos(productos);
};


/* =========================
   REPONER STOCK CON MODAL
========================= */

let productoParaReponer = null;

window.reponerStock = function (id) {

    // Buscamos el producto seleccionado
    const producto = productos.find(function (producto) {
        return producto.id === id;
    });

    if (!producto || producto.activo === false) {
        return;
    }

    // Guardamos el producto seleccionado
    productoParaReponer = producto;

    // Mostramos sus datos en el modal
    document.getElementById("nombreProductoReposicion").textContent =
        producto.nombre;

    document.getElementById("stockActualReposicion").textContent =
        producto.stock;

    // Limpiamos el campo de cantidad
    document.getElementById("cantidadReposicion").value = "";

    // Abrimos el modal de Bootstrap
    const modal = new bootstrap.Modal(
        document.getElementById("modalReposicion")
    );

    modal.show();
};

// Procesamos el formulario de reposición
document.getElementById("formReposicion").addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();

        if (!productoParaReponer) {
            return;
        }

        const campoCantidad =
            document.getElementById("cantidadReposicion");

        const cantidad = Number(campoCantidad.value);

        // Validamos la cantidad ingresada
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            campoCantidad.setCustomValidity(
                "Ingresá un número entero mayor que cero."
            );
            campoCantidad.reportValidity();
            campoCantidad.setCustomValidity("");
            return;
        }

        // Sumamos las unidades recibidas
        productoParaReponer.stock =
            Number(productoParaReponer.stock) + cantidad;

        // Guardamos el inventario actualizado
        localStorage.setItem(
            "productos",
            JSON.stringify(productos)
        );

       // Actualizamos la tabla de Productos
        mostrarProductos(productos);

      // Actualizamos el Dashboard
       actualizarDashboard();

     // Actualizamos el módulo de Stock
       if (typeof mostrarStock === "function") {
              mostrarStock();
        }
        
        // Guardamos los datos para mostrar el mensaje
        const nombreRepuesto = productoParaReponer.nombre;
        const stockFinal = productoParaReponer.stock;

        // Cerramos el modal de reposición
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("modalReposicion")
        );

        modal.hide();

        // Limpiamos la selección
        productoParaReponer = null;

        // Mostramos la notificación de éxito
        Swal.fire({
            icon: "success",
            title: "¡Reposición exitosa!",
            html: `
                <p style="margin-bottom: 8px;">
                    <strong>${nombreRepuesto}</strong>
                </p>
                <p style="margin-bottom: 0;">
                    Se agregaron <strong>${cantidad}</strong> unidades.<br>
                    Stock actual: <strong>${stockFinal} unidades</strong>
                </p>
            `,
            confirmButtonText: "¡Perfecto!",
            confirmButtonColor: "#8a5a3b",
            background: "#fffaf3",
            color: "#4a2938",
            customClass: {
                popup: "alerta-dulce-trigo"
            }
        });
  })