//-------------------------------------------------------------------
// PROYECTO FINAL
// Fecha de primer entrega: 29-10-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const {Router} = require('express')
const routerProductos = new Router()

devuelvoError = (error,metodo,path) => {
    if (metodo) return ({error:error, descripcion: `La ruta http://${path} con el metodo ${metodo} no esta autorizada`})
    else return 'Producto no encontrado'
}

const Contenedor = require ("./Contenedor");
a = new Contenedor("./DB/productos.txt")

let administrador = false

loadUser = (req,res,next) => {
    const {user} = req.query
    if(user == 'admin') {
        administrador= true
        next();
    }
    else {
        administrador= false
        next();
    }
}

routerProductos.get('/',async (req,res)=> res.json(await a.getAll()))

routerProductos.get('/:id',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const {id}= req.params
        let b=await a.getById(id)
        if(b.length == 0) {b=devuelvoError()}
        res.json(b)
    }
})

routerProductos.post('/',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const time = new Date()
        const nuevoProducto = { ...req.body, timestamp: time.toLocaleString() }
        res.json(`Nuevo producto ID: ${await a.save(nuevoProducto)} cargado OK!`)
    }
})

routerProductos.put('/:id',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const { id } = req.params
        const time = new Date()
        const nuevoProducto = { ...req.body, timestamp: time.toLocaleString() }
        let productos=await a.getById(id)
        if(productos.length == 0) {res.json(devuelvoError())}
        else {
            let productos=await a.getAll()
            await a.deleteAll()
                for (let i = 0; i < productos.length; i++) {
                    if(productos[i].id==id) {productos[i]=nuevoProducto}
                    await a.save(productos[i]);
                }
                res.json(await a.getById(id))
            } 
        }
})

routerProductos.delete('/:id',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const { id } = req.params
        let b=await a.getById(id)
        if(b.length == 0) {res.json(devuelvoError())}
        else  {
            await a.deleteById(id)
            res.json(`Producto ID: ${id} eliminado OK!`)
        }
    }
})

module.exports={routerProductos}