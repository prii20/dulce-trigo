
/* =========================
   MÓDULO DE CLIENTES
========================= */

// Recuperar clientes guardados
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

// Elementos del HTML
const tablaClientes = document.getElementById("tablaClientes");
const formularioCliente = document.getElementById("formCliente");
const formularioClienteContenedor = document.getElementById("formularioClienteContenedor");

const btnNuevoCliente = document.getElementById("btnNuevoCliente");
const btnCancelarCliente = document.getElementById("btnCancelarCliente");

const buscarCliente = document.getElementById("buscarCliente");

// Guardar clientes en LocalStorage
function guardarClientes() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
}

// Mostrar clientes en la tabla
function mostrarClientes() {

    if (!tablaClientes) return;

    const totalActivos = clientes.filter(c => c.activo !== false).length;

    document.getElementById("totalClientes").textContent = clientes.length;

    document.getElementById("clientesActivos").textContent = totalActivos;

    if (clientes.length === 0) {
        tablaClientes.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    Todavía no hay clientes registrados.
                </td>
            </tr>
        `;
        return;
    }

    tablaClientes.innerHTML = clientes.map(function (cliente) {

        const activo = cliente.activo !== false;

        return `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.correo || "Sin correo"}</td>

                <td>
                    <span class="estado-cliente ${activo ? "activo" : "inactivo"}">
                        ${activo ? "Activo" : "Inactivo"}
                    </span>
                </td>

                <td>
                    ${activo
                        ? `<button type="button" onclick="editarCliente(${cliente.id})">Editar</button>`
                        : ""
                    }

                    <button
                        type="button"
                        onclick="cambiarEstadoCliente(${cliente.id})">
                        ${activo ? "Dar de baja" : "Reactivar"}
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}

// Abrir formulario para nuevo cliente
function abrirFormularioCliente() {

    formularioCliente.reset();

    document.getElementById("idCliente").value = "";

    document.getElementById("tituloFormularioCliente").textContent =
        "Nuevo cliente";

    document.getElementById("btnGuardarCliente").textContent =
        "Guardar cliente";

    formularioClienteContenedor.hidden = false;

    document.getElementById("nombreCliente").focus();
}

// Cerrar formulario
function cerrarFormularioCliente() {
    formularioCliente.reset();
    formularioClienteContenedor.hidden = true;
}

// Registrar o actualizar cliente
formularioCliente.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const id = document.getElementById("idCliente").value;

    const nombre = document.getElementById("nombreCliente").value.trim();
    const telefono = document.getElementById("telefonoCliente").value.trim();
    const correo = document.getElementById("correoCliente").value.trim();

    if (!nombre || !telefono) {
        Swal.fire({
            icon: "warning",
            title: "Datos incompletos",
            text: "Completá el nombre y el teléfono."
        });
        return;
    }

    if (id) {

        // Editar cliente existente
        const cliente = clientes.find(function (item) {
            return item.id === Number(id);
        });

        if (!cliente) return;

        cliente.nombre = nombre;
        cliente.telefono = telefono;
        cliente.correo = correo;

    } else {

        // Crear nuevo cliente
        const nuevoCliente = {
            id: Date.now(),
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            activo: true
        };

        clientes.push(nuevoCliente);
    }

    guardarClientes();
    mostrarClientes();
    cerrarFormularioCliente();

    Swal.fire({
        icon: "success",
        title: "¡Cliente guardado!",
        text: "Los datos se guardaron correctamente.",
        confirmButtonColor: "#8a5a3b"
    });

});

// Editar cliente
window.editarCliente = function (id) {

    const cliente = clientes.find(function (item) {
        return item.id === id && item.activo !== false;
    });

    if (!cliente) return;

    document.getElementById("idCliente").value = cliente.id;
    document.getElementById("nombreCliente").value = cliente.nombre;
    document.getElementById("telefonoCliente").value = cliente.telefono;
    document.getElementById("correoCliente").value = cliente.correo || "";

    document.getElementById("tituloFormularioCliente").textContent =
        "Editar cliente";

    document.getElementById("btnGuardarCliente").textContent =
        "Actualizar cliente";

    formularioClienteContenedor.hidden = false;
};


/* =========================
   CAMBIAR ESTADO DEL CLIENTE
========================= */

window.cambiarEstadoCliente = function (id) {

    const cliente = clientes.find(function (item) {
        return item.id === id;
    });

    if (!cliente) return;
const estaActivo = cliente.activo !== false;

Swal.fire({
    icon: "warning",
    title: estaActivo
        ? "¿Dar de baja al cliente?"
        : "¿Reactivar al cliente?",
    text: estaActivo
        ? "El cliente pasará a estar inactivo, pero sus datos se conservarán."
        : "El cliente volverá a estar activo.",
    showCancelButton: true,
    confirmButtonText: estaActivo ? "Sí, dar de baja" : "Sí, reactivar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: estaActivo ? "#b94a48" : "#347447",
    cancelButtonColor: "#8a5a3b"
}).then(function (resultado) {
    if (resultado.isConfirmed) {
        cliente.activo = !estaActivo;

        guardarClientes();
        mostrarClientes();
        cargarClientesVenta();

        Swal.fire({
            icon: "success",
            title: estaActivo ? "Cliente dado de baja" : "Cliente reactivado",
            text: estaActivo
                ? "El cliente ahora está inactivo."
                : "El cliente ahora está activo."
        });
    }
});
 }

// Conectar botones
btnNuevoCliente.addEventListener("click", abrirFormularioCliente);
btnCancelarCliente.addEventListener("click", cerrarFormularioCliente);

// Buscador
if (buscarCliente) {

    buscarCliente.addEventListener("input", function () {

        const texto = this.value.trim().toLowerCase();

        const clientesFiltrados = clientes.filter(function (cliente) {

            return (
                cliente.activo !== false &&
                (
                    cliente.nombre.toLowerCase().includes(texto) ||
                    cliente.telefono.includes(texto) ||
                    (cliente.correo || "").toLowerCase().includes(texto)
                )
            );
        });

        mostrarClientes(clientesFiltrados);
    });
}

// Mostrar clientes al cargar
mostrarClientes();


// Cargar clientes activos en el selector de ventas
function cargarClientesVenta() {
    const selector = document.getElementById("clienteVenta");

    if (!selector) return;

    selector.innerHTML = `<option value="">Venta sin cliente</option>`;

    const clientesActivos = clientes.filter(function (cliente) {
        return cliente.activo !== false;
    });

    clientesActivos.forEach(function (cliente) {
        const opcion = document.createElement("option");

        opcion.value = cliente.id;
        opcion.textContent = cliente.nombre;

        selector.appendChild(opcion);
    });
}

cargarClientesVenta();