//9 ######################################## LIBRERIAS (FIJO) ######################################## 
const express = require ("express");
const app = express();
require("dotenv").config({path:'./env/.env'});
const bcrypt = require ("bcryptjs");
const session = require ("express-session");
const db = require("./database/db");


//9.2 ######################################## SERVIDOR ######################################## 
app.listen(2000, () => {  //
    console.log("El servidor está ejecutándose en http://localhost:4000");
});


//9.3 ######################################## MIDDLEWARES (FIJO) ######################################## 
app.use(express.urlencoded({ extended: false })); //leer datos desde formularios html
app.use(express.json()); //leer datos desde json


// 9.7 ######################################## DEFINIR LA SESION (FIJO) ######################################## 
app.use(
    session({
        secret: "secret", //"secret" es modificable, clave secreta para cifrar la cookie
        resave: false, //guardar la sesión en cada solicitud
        saveUninitialized: false, //guarda en cada peticion cuando se produzcan cambios
    })
);


//9.4 ######################################## DEFINIR RUTAS ######################################## 


app.get("/", (req, res) => {
    if (req.session.loggedin) {
        res.render("index", { user: req.session.name, login: true });
    } else {
        res.render("index", { user: "Debe iniciar sesión", login: false });
    }
});


// En index.js
app.get("/login", (req, res) => {
    res.render("login", { alert: false }); // <--- ¡Asegúrate de que esto esté así!
});

app.get("/registro", (req, res) => {
    // Cuando se accede directamente a /registro, pasamos 'alert: false' por defecto.
    res.render("register", { alert: false });
});


//9.5 ######################################## CARPETA PUBLICA (FIJO) ######################################## 
app.use('/resources', express.static(__dirname + '/public'));



//9.6 ######################################## VISTAS (FIJO) ######################################## 
app.set("view engine", "ejs");
app.set("views", "./views"); //definimos la carpeta (no es necesario si la carpeta se llama views)
// app.set("views", __dirname + "/views"); //definimos la carpeta (no es necesario si la carpeta se llama views)






// 9.8 ######################################## RUTAS POST ########################################
// Ruta de registro
app.post("/register", async (req, res) => {
    //Recoger los datos del formulario
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;


        // Validación básica: campos no vacíos
    if (!user || !name || !rol || !pass) {
        return res.render("register", {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Todos los campos son obligatorios",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta: "registro", // Redirige a la página de registro de nuevo
        });
    }


    //Cifrar la contraseña
    const passwordHash = await bcrypt.hash(pass, 8);


// ######################################## BBDD ######################################## 
// Ruta de registro
    db.query(
        "INSERT INTO usuarios SET ?",
        {
            usuario: user,
            nombres: name,
            rol: rol,
            pass: passwordHash
        },
        async (error, results) => {
            if (error) {
                console.log(error);
                // Si hay un error de base de datos (ej. usuario duplicado)
                let errorMessage = "Error en el registro.";
                if (error.code === 'ER_DUP_ENTRY') { // Código de error para entrada duplicada en MySQL
                    errorMessage = "El nombre de usuario ya existe. Por favor, elija otro.";
                }
                res.render("register", {
                    alert: true,
                    alertTitle: "Error de Registro",
                    alertMessage: errorMessage,
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: "registro", // Se mantiene en la página de registro
                });
            } else {
                res.render("register", {
                    alert: true,
                    alertTitle: "Registro",
                    alertMessage: "¡Registro exitoso!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 2500,
                    ruta: "Login",
                });
            }
        }
    );
});

// ######################################## INICIO DE SESION ######################################## 

app.post("/auth", async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    //comprobamos si existe el usuario y la contraseña
    if (user && pass) {
        //comprobamos si existe el usuario em la base de datos
        db.query(
            "SELECT * FROM usuarios WHERE usuario = ?",
            [user],
            async (error, results) => {
                //comprobamos si hemos obtenido resultados y si ha coincidido la contraseña en tal caso
                if (
                    results.length == 0 ||
                    !(await bcrypt.compare(pass, results[0].pass))
                ) {
                    //Mensaje simple para avisar de que es incorrecta la autenticación
                    res.send("login", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contraseña erróneo",
                        alertIcon: "error",
                        showConfirmButton: true,
                        timer: false,
                        ruta: "login",
                        login: false,
                    });
                } else {
                    //variables de sesión
                    req.session.loggedin = true;
                    req.session.name = results[0].nombre;
                    //Mensaje simple para avisar de que es correcta la autenticación
                    res.render('login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡Inicio de sesión exitoso!",
                        alertIcon:'success',
                        showConfirmButton: false,
                        timer: 2500,
                        ruta: "",
                        login: true,
                    });
                } //Mensaje simple para avisar de que es correcta la autenticación
            }
        );
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Ingrese el usuario y la contraseña",
            alertIcon:'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login',
            login:true,
        });
    }
});


// Ruta de logout
app.get('/logout', (req, res) => {
    // Destruir la sesión actual del usuario
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            // Podrías renderizar una página de error o simplemente redirigir
            res.redirect('/'); // Redirigir a la página de inicio incluso si hay un error
        } else {
            // Eliminar la cookie de sesión del navegador
            res.clearCookie('connect.sid'); // 'connect.sid' es el nombre por defecto de la cookie de sesión de Express
            // Redirigir al usuario a la página de login o a la página principal (donde se vea que no está logueado)
            res.redirect('/login'); // O res.redirect('/'); si tu '/' maneja el estado de no logueado
        }
    });
});


