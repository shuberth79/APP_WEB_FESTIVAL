//9 iniciar las librerias
const express = require ("express")
const app = express();


//9.2 crear el servidor
app.listen(3000, () => {  //
    console.log("El servidor está ejecutándose en http://localhost:3000");
});

// 9.3 Definir los middlewares
app.use(express.urlencoded({ extended: false })); //leer datos desde formularios html
app.use(express.json()); //leer datos desde json

//9.4 Definir las rutas
app.get("/", (req, res) => {
    res.send("Hello World!");
});

