//9 ######################################## LIBRERIAS ######################################## 
const express = require ("express");
const app = express();
require("dotenv").config({path:'./env/.env'});
const bcrypt = require ("bcryptjs");
const session = require ("express-session");
const db = require("./database/db");


//9.2 ######################################## SERVIDOR ######################################## 
app.listen(4000, () => {  //
    console.log("El servidor está ejecutándose en http://localhost:4000");
});


//9.3 ######################################## Definir los middlewares ######################################## 
app.use(express.urlencoded({ extended: false })); //leer datos desde formularios html
app.use(express.json()); //leer datos desde json


//9.4 ######################################## DEFINIR RUTAS ######################################## 
app.get("/", (req, res) => {
    res.render("index", {user: "SHU"});
});
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/registro", (req, res) => {
    res.render("register");
});


//9.5 ######################################## CARPETA PUBLICA ######################################## 
app.use('/resources', express.static(__dirname + '/public'));



//9.6 ######################################## VISTAS ######################################## 
app.set("view engine", "ejs");
app.set("views", "./views"); //definimos la carpeta (no es necesario si la carpeta se llama views)



// 9.7 ######################################## DEFINIR LA SESION ######################################## 
app.use(
    session({
        secret: "secret", //"secret" es modificable, clave secreta para cifrar la cookie
        resave: false, //guardar la sesión en cada solicitud
        saveUninitialized: false, //guarda en cada peticion cuando se produzcan cambios
    })
);


// 9.8 ######################################## RUTAS POST ######################################## 
app.post("/register", async (req, res) => {
    //variables para guardar la información de los campos del formulario
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;

    //cifrar la contraseña
    const passwordHash = await bcrypt.hash(pass, 8);
    //let passwordHash = await bcrypt.hash(pass, 8);


// ######################################## BBDD ######################################## 
    db.query(
        "INSERT INTO usuarios SET ?",
        {
            usuario: user,
            nombre: name,
            rol: rol,
            pass: passwordHash
        },
        async (error, results) => {
            if (error) {
                console.log(error);
            } else {
                res.render("register", {
                    alert: true,
                    alertTitle: "Registro",
                    alertMessage: "¡Registro exitoso!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 2500,
                    ruta: "",
                });
            }
        }
    );
});

// ######################################## 