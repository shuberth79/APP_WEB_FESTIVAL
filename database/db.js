const mysql = require("mysql2");

// Configuracion de la conexion
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

//Levantar la conexion
conexion.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Conectado a la base de datos");
});

module.exports = conexion;