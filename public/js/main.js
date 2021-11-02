//-------------------------------------------------------------------
// PROYECTO FINAL
// Fecha de primer entrega: 29-10-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const socket = io.connect();

//Genero un nuevo carrito para la sesion en curso
let idCarrito= 0

generaCarrito().then( (r) => idCarrito=r)
//---------------------------------------
// Manejo de eventos entrantes al cliente
//---------------------------------------
socket.on('updateProd', () => {
    console.log("cliente <-- Nuevo evento updateProd")
    console.log("Hola--> " + socket.id)
    listarProductos() 
});
socket.on('updateCarritoMostrar', () => {
    console.log("cliente <-- Nuevo evento updateCarritoMostrar")
    cargaCarrito(true) 
});
socket.on('updateCarrito', () => {
    console.log("cliente <-- Nuevo evento updateCarrito")
    cargaCarrito(false) 
});

//---------------------------------------
// Ejecuto APIs del lado del cliente
//---------------------------------------
async function buscarProductos() {
    return fetch('/api/productos')
        .then(prod => prod.json())
}

async function buscarProducto(id) {
    return fetch(`/api/productos/${id}?user=admin`) //FIJO EL USUARIO ADMIN
        .then(prod => prod.json())
}

async function buscarProdCarrito(idCarrito) {
    return fetch(`/api/carrito/${idCarrito}/productos?user=admin`) //FIJO EL USUARIO ADMIN
        .then(prod => prod.json())
}

async function cargaProd() {
    const form = document.querySelector('form');
    const data = { 
        nombre:form[0].value,
        precio: form[1].value,
        descripcion: form[2].value,
        codigo: form[3].value,
        Stock: form[4].value,
        foto: form[5].value
    };
    fetch('/api/productos?user=admin', {     //FIJO EL USUARIO ADMIN
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(socket.emit('updateProd', 'Se cargo nuevo Producto!'))
        .catch(error => console.error(error))
}

async function actualizarProd(id) {
    const form = document.querySelector('form');
    const data = { 
        nombre:form[0].value,
        precio: form[1].value,
        descripcion: form[2].value,
        codigo: form[3].value,
        Stock: form[4].value,
        foto: form[5].value
    };
    fetch(`/api/productos/${id}?user=admin`, {     //FIJO EL USUARIO ADMIN
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(data)
        })
        .then(socket.emit('updateProd', `Se actualizo el producto id: ${id}`))
        .catch(error => console.error(error))
}

async function eliminarProd(id){
    fetch(`/api/productos/${id}?user=admin`, {     //FIJO EL USUARIO ADMIN
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE'
        })
        .then(socket.emit('updateProd', `Se elimino el producto id: ${id}`))
        .catch(error => console.error(error))
}

async function generaCarrito(){
    return fetch(`/api/carrito?user=admin`, {     //FIJO EL USUARIO ADMIN
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
        })
        .then( response => response.json())
        .catch(error => console.error(error))
}

async function agregarProdCarrito(id_prod){
    console.log("idCarrito en agrega: "+ idCarrito)
    const data = { producto: {id: id_prod}}
    fetch(`/api/carrito/${idCarrito}/productos?user=admin`, {     //FIJO EL USUARIO ADMIN
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
        })
    .then(socket.emit('updateCarrito', `Se agrego Producto id ${id_prod} al Carrito id ${idCarrito}!`))
    .catch(error => console.error(error))
}

async function eliminarProdCarrito(id_prod){
    fetch(`/api/carrito/${idCarrito}/productos/${id_prod}?user=admin`, {     //FIJO EL USUARIO ADMIN
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'DELETE',
        })
    .then(socket.emit('updateCarritoMostrar', `Se elimino Producto id ${id_prod} del Carrito id ${idCarrito}!`))
    .catch(error => console.error(error))
}

//---------------------------------------
//Funciones para la carga de html
//---------------------------------------
async function listarProductos() {
    const plantillaProd = await buscarPlantillaProducto()
    const productos = await buscarProductos()
    const html = armarHTMLproductos(plantillaProd, productos)
    document.getElementById('productos').innerHTML = html
}

async function cargaPaginaProd(mostrarFormCarga) {
    const plantillaCarga = await buscarPlantillaCargaProd()
    const html = armarHTMLcarga(plantillaCarga,mostrarFormCarga)
    document.getElementById('carga').innerHTML = html
}

async function cargaActualizaProd(id,mostrarActualizarProd) {
    const plantillaAct = await buscarPlantillaActProd()
    const prod = await buscarProducto(id)
    const html = armarHTMLactualizaProd(plantillaAct,prod,mostrarActualizarProd)
    document.getElementById('carga').innerHTML = html
}

async function cargaCarrito(mostrarCarrito) {
    console.log("id carrito: " + idCarrito)
    const prods_carrito = await buscarProdCarrito(idCarrito)
    const plantillaCarrito = await buscarPlantillaCarrito()
    const html = armarHTMLcarrito(plantillaCarrito,prods_carrito,mostrarCarrito)
    document.getElementById('carrito').innerHTML = html
}

//---------------------------------------
// Busco plantillas HBS
//---------------------------------------
function buscarPlantillaProducto() {
     return fetch('/plantillas/productos.hbs')
         .then(respuesta => respuesta.text())
 }

 function buscarPlantillaCargaProd() {
    return fetch('/plantillas/carga.hbs')
        .then(respuesta => respuesta.text())
}

function buscarPlantillaActProd() {
    return fetch('/plantillas/actualizaProd.hbs')
        .then(respuesta => respuesta.text())
}
function buscarPlantillaCarrito() {
    return fetch('/plantillas/carrito.hbs')
        .then(respuesta => respuesta.text())
}

//---------------------------------------
// Armo HTMLs
//---------------------------------------
function armarHTMLproductos(plantillaProd, productos) {
     const render = Handlebars.compile(plantillaProd);
     const html = render({ productos })
    return html
}

function armarHTMLcarga(plantillaCarga,mostrarFormCarga) {
    const render = Handlebars.compile(plantillaCarga);
    const html = render({ mostrarFormCarga })
   return html
}
function armarHTMLactualizaProd(plantillaAct,prod,mostrarActualizarProd) {
    const render = Handlebars.compile(plantillaAct);
    const html = render({ prod,mostrarActualizarProd })
   return html
}
function armarHTMLcarrito(plantillaCarrito,prods_carrito,mostrarCarrito) {
    const render = Handlebars.compile(plantillaCarrito);
    const html = render({ prods_carrito,mostrarCarrito })
   return html
}