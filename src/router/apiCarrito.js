//-------------------------------------------------------------------
// PROYECTO FINAL
// Fecha de primer entrega: 29-10-21
// Alumno: Damian del Campo
//-------------------------------------------------------------------
const {Router} = require('express')
const routerCarrito = new Router()

devuelvoError = (error,metodo,path) => {
    if (metodo) return ({error:error, descripcion: `La ruta http://${path} con el metodo ${metodo} no esta autorizada`})
    else return 'Carrito no encontrado'
}

const Contenedor = require ("./Contenedor");
a = new Contenedor("./DB/productos.txt")
b = new Contenedor("./DB/carrito.txt")


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

routerCarrito.get('/:id/productos',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const {id}= req.params
        let carrrito=await b.getById(id)
        if(carrrito.length == 0) res.json(devuelvoError())
        else res.json(carrrito[0].producto)
    }
})

routerCarrito.post('/',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const time = new Date()
        const nuevoCarrito = { producto: [], timestamp: time.toLocaleString() }
        res.json(await b.save(nuevoCarrito))
    }
})

routerCarrito.post('/:id/productos',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const { id } = req.params
        let newProd = req.body.producto
        let carritos=await b.getAll()
        let carrito=await b.getById(id)
        const productos= await a.getAll()
        if(carrito.length == 0) res.json(devuelvoError())
        else {
            const productoIndex = productos.findIndex(p => p.id == newProd.id)
            if (productoIndex === -1) {
                res.json(`Error al actualizar carrito. Producto ID: ${newProd.id} no existe`)
            }
            newProd =  {
                    "nombre": productos[productoIndex].nombre,
                    "precio": productos[productoIndex].precio,
                    "descripcion": productos[productoIndex].descripcion,
                    "codigo": productos[productoIndex].codigo,
                    "Stock": productos[productoIndex].Stock,
                    "foto": productos[productoIndex].foto,
                    "timestamp": productos[productoIndex].timestamp,
                    "id": productos[productoIndex].id
                } 
            carrito[0].producto.push(newProd)   
            await b.deleteAll()
            for (let i = 0; i < carritos.length; i++) {
                if(carritos[i].id==id) {carritos[i]=carrito[0]}
                await b.save(carritos[i]);
            }
            res.json(await b.getById(id))
        }
    }
})

routerCarrito.delete('/:id',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const { id } = req.params
        let carrito=await b.getById(id)
        if(carrito.length == 0) {res.json(devuelvoError())}
        else  {
            await b.deleteById(id)
            res.json(`Producto ID: ${id} eliminado OK!`)
        }
    }
})

routerCarrito.delete('/:id/productos/:id_prod',loadUser, async (req,res)=> {
    if (!administrador)  res.status(401).json(devuelvoError(-1,req.method,req.headers.host+req.originalUrl))
    else {
        const { id,id_prod } = req.params
        let carritos=await b.getAll()
        let carrito=await b.getById(id)
        if(carrito.length == 0) res.json(devuelvoError())
        else {
            const newCarrito = {producto: carrito[0].producto.filter(p => p.id != id_prod), timestamp: carrito[0].timestamp,id: id}
            await b.deleteAll()
            for (let i = 0; i < carritos.length; i++) {
                if(carritos[i].id==id) {carritos[i]=newCarrito}
                await b.save(carritos[i]);
            }
            res.json(await b.getById(id))
        }
    }
})

module.exports={routerCarrito}