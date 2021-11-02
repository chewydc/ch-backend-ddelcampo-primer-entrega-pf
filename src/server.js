//-------------------------------------------------------------------
// PROYECTO FINAL
// Fecha de primer entrega: 29-10-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const {routerProductos} = require("./router/apiProductos")
const {routerCarrito} = require("./router/apiCarrito")

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

app.use('/api/productos',routerProductos)
//app.use('/productos',routerProductos)

app.use('/api/carrito',routerCarrito)
//app.use('/carrito',routerCarrito)

io.on('connection', clientSocket => {
  console.log(`#${clientSocket.id} se conectó`)
  io.emit('updateProd')
  clientSocket.on('updateProd', () => {
    console.log("Server <-- Nuevo evento del tipo updateProd")
    //clientSocket.emit('updateProd')
    io.sockets.emit('updateProd')
  })
  clientSocket.on('updateCarrito', () => {
    console.log("Server <-- Nuevo evento del tipo Carrito update")
    clientSocket.emit('updateCarrito')
  })
  clientSocket.on('updateCarritoMostrar', () => {
    console.log("Server <-- Nuevo evento del tipo updateCarritoMostrar")
    clientSocket.emit('updateCarritoMostrar')
  })
})

app.get("/", (req,res)=> {
  res.sendFile('index.html')
})


//-------------------------------------------------------------------
// Cargo el server
const PORT = process.env.PORT || 8080
const server = httpServer.listen(PORT, () => {
console.info(`Servidor HTTP escuchando en el puerto ${server.address().port}`)
})
server.on("error", error => console.log(`Error en servidor ${error}`))

