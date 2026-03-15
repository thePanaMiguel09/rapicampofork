require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5012;

// ====== Middlewares ======
app.use(cors()); // Permite peticiones desde el frontend (localhost:5012)
app.use(express.json()); // Necesario para leer req.body en formato JSON

// ====== Conexión a MySQL ======
// La conexión se realiza usando el pool, que es más eficiente
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Probar conexión
(async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Conectado a MySQL local");
        connection.release();
    } catch (err) {
        console.error("❌ Error al conectar MySQL:", err);
    }
})();

// ===============================================
// ====== API REST: RUTAS DE AUTENTICACIÓN Y DATOS ======
// ===============================================

// 1. Listar usuarios (GET /api/usuarios)
app.get("/api/usuarios", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, nombres, apellidos, correo FROM usuarios");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
});

// 2. Registrar usuario (POST /api/register)
app.post("/api/register", async (req, res) => {
    try {
        const { nombres, apellidos, cc, telefono, correo, password } = req.body;
        if (!nombres || !apellidos || !cc || !telefono || !correo || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // NOTA DE SEGURIDAD: Usar bcrypt para hashear la contraseña aquí es crucial
        const [result] = await db.query(
            "INSERT INTO usuarios (nombres, apellidos, cc, telefono, correo, password) VALUES (?, ?, ?, ?, ?, ?)",
            [nombres, apellidos, cc, telefono, correo, password]
        );

        res.json({ message: "✅ Usuario registrado", userId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al registrar usuario" });
    }
});

// 3. Login (POST /api/login)
app.post("/api/login", async (req, res) => {
    try {
        const { correo, password } = req.body;
        if (!correo || !password) {
            return res.status(400).json({ message: "Correo y contraseña requeridos" });
        }

        const [rows] = await db.query(
            "SELECT id, nombres, apellidos, correo FROM usuarios WHERE correo = ? AND password = ?",
            [correo, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        res.json({ message: "✅ Login exitoso", user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
});

// 4. Publicar Servicio (POST /api/services) - Escritura
app.post("/api/services", async (req, res) => {
    try {
        const { userId, type, date, availability, description } = req.body;

        if (!userId || !type || !date || !description) {
            return res.status(400).json({ message: "Faltan datos obligatorios para el servicio." });
        }
        
        if (type !== 'oferta' && type !== 'necesidad') {
            return res.status(400).json({ message: "El tipo de servicio debe ser 'oferta' o 'necesidad'." });
        }

        const query = `
            INSERT INTO servicios (userId, type, date, availability, description) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            userId, 
            type, 
            date, 
            availability || null, 
            description
        ]);

        res.status(201).json({ 
            message: `✅ Servicio de tipo '${type}' publicado con éxito.`, 
            serviceId: result.insertId 
        });
    } catch (err) {
        console.error("Error al publicar servicio:", err);
        res.status(500).json({ message: "Error interno al publicar el servicio." });
    }
});

// 5. Cargar Muro de Servicios (GET /api/services) - Lectura
app.get("/api/services", async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*, 
                u.nombres AS user_nombres, 
                u.apellidos AS user_apellidos,
                u.telefono AS user_telefono,
                u.correo AS user_correo
            FROM servicios s
            JOIN usuarios u ON s.userId = u.id
            ORDER BY s.creado_en DESC
        `;
        const [servicios] = await db.query(query);
        
        // Devuelve el JSON con la lista de servicios.
        res.json(servicios); 
    } catch (err) {
        console.error("Error al obtener servicios:", err);
        res.status(500).json({ message: "Error interno al cargar el muro de servicios." }); 
    }
});

// ... código anterior (app.get("/api/services", ...))

// 6. Registrar Solicitud de Contacto (POST /api/requests) - ¡NUEVA RUTA!
app.post("/api/requests", async (req, res) => {
    try {
        // El frontend envía: { serviceId: ID_SERVICIO, userId: ID_USUARIO }
        const { serviceId, userId } = req.body; 

        if (!serviceId || !userId) {
            return res.status(400).json({ message: "Se requiere el ID del servicio y del solicitante." });
        }

        // Renombramos userId a requesterId para que coincida con la tabla 'solicitudes'
        const requesterId = userId; 

        // Usamos sentencias preparadas para el INSERT
        const query = `
            INSERT INTO solicitudes (serviceId, requesterId) 
            VALUES (?, ?)
        `;
        
        const [result] = await db.query(query, [serviceId, requesterId]);

        res.status(201).json({ 
            message: "✅ Solicitud de contacto registrada.", 
            requestId: result.insertId 
        });
    } catch (err) {
        // Este error puede ocurrir si el serviceId o requesterId no existe en sus tablas
        console.error("Error al registrar solicitud:", err);
        res.status(500).json({ message: "Error interno al registrar la solicitud." }); 
    }
});

// ... código anterior (app.post("/api/requests", ...))

// 7. Obtener Mis Servicios y Solicitudes Recibidas (GET /api/mis-servicios/:userId) - ¡NUEVA RUTA!
app.get("/api/mis-servicios/:userId", async (req, res) => {
    try {
        // 1. Obtener el ID del usuario de los parámetros de la URL
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario para consultar sus servicios." });
        }

        // 2. Llamar al procedimiento almacenado
        const query = `CALL misServiciosConSolicitantes(?)`;
        
        // MySQL2 devuelve un array anidado [ [datos], [info] ]. Solo necesitamos los datos (el primer array).
        const [rows] = await db.query(query, [userId]);
        const solicitudesRecibidas = rows[0]; // Los datos reales están en el primer elemento

        // 3. Devolver el resultado
        if (solicitudesRecibidas.length === 0) {
            return res.status(200).json({ message: "Este usuario no ha publicado servicios o no ha recibido solicitudes.", data: [] });
        }
        
        res.json(solicitudesRecibidas); 
    } catch (err) {
        console.error("Error al consultar mis servicios y solicitudes:", err);
        res.status(500).json({ message: "Error interno al obtener el listado de solicitudes recibidas." }); 
    }
});

// ... código anterior (app.get("/api/mis-servicios/:userId", ...))

// 8. Obtener Solicitudes Realizadas por el Usuario (GET /api/mis-solicitudes/:userId) - ¡NUEVA RUTA!
app.get("/api/mis-solicitudes/:userId", async (req, res) => {
    try {
        // 1. Obtener el ID del usuario (el solicitante) de los parámetros de la URL
        const userId = req.params.userId; // Este es el p_requester_id para el procedimiento

        if (!userId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario para consultar sus solicitudes realizadas." });
        }

        // 2. Llamar al procedimiento almacenado misSolicitudesHechas
        const query = `CALL misSolicitudesHechas(?)`;
        
        // MySQL2 devuelve un array anidado. Los datos reales están en rows[0].
        const [rows] = await db.query(query, [userId]);
        const solicitudesRealizadas = rows[0]; 

        // 3. Devolver el resultado
        if (solicitudesRealizadas.length === 0) {
            return res.status(200).json({ message: "Aún no has realizado ninguna solicitud de servicio.", data: [] });
        }
        
        res.json(solicitudesRealizadas); 
    } catch (err) {
        console.error("Error al consultar las solicitudes hechas por el usuario:", err);
        res.status(500).json({ message: "Error interno al obtener el listado de solicitudes realizadas." }); 
    }
});

// ===============================================
// ====== SERVIR FRONTEND Y MANEJO DE RUTAS FALLIDAS ======
// ... el resto de tu server.js ...

// ===============================================
// ====== SERVIR FRONTEND Y MANEJO DE RUTAS FALLIDAS ======
// ... el resto de tu server.js ...

// ===============================================
// ====== SERVIR FRONTEND Y MANEJO DE RUTAS FALLIDAS ======
// ... el resto de tu server.js ...

// ===============================================
// ====== SERVIR FRONTEND Y MANEJO DE RUTAS FALLIDAS ======
// ===============================================

// Servir Frontend (Archivos estáticos como CSS, JS, HTML)
app.use(express.static(path.join(__dirname, "../frontend")));

// Manejo de rutas no encontradas (Catch-all)
// IMPORTANTE: Esto debe ir al final, después de todas las rutas de API.
// Dirige todas las rutas que no son API a index.html para que el frontend (SPA) las maneje.
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// ====== Iniciar Servidor ======
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = db;