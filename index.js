//9 iniciar las librerias
const express = require ("express")
const app = express();
require = ("dotenv").config({path:"./env/.env"});
const bcrypt = require ("bcrypt.js");
const session = require ("express-session");

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

// 9.5 Configurar carpeta publica o estática
app.use('/resources', express.static(__dirname + '/public'));

//9.6 Definir el motor de vistas
app.set("view engine", "ejs");
app.set("views", "./views"); //definimos la carpeta (no es necesario si la carpeta se llama views)


// 9.7 Definir la session
app.use(
    session({
        secret: "secret", //"sacret" es modificable, clave secreta para cifrar la cookie
        resave: false, //guardar la sesión en cada solicitud
        saveUninitialized: false, //guarda en cada peticion cuando se produzcan cambios
    })
);
