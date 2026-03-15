const express = require("express");
const router = express.Router();
// Asume que tu conexión a la BD se importa así:
const db = require('../db/connection'); // AJUSTA ESTA RUTA SEGÚN TU PROYECTO

// 1. RUTA POST: Publicar Servicio (Voy al pueblo / Necesito servicio)
router.post("/", async (req, res) => {
    try {
        const { type, date, availability, description, userId } = req.body;
        
        // Validación básica
        if (!userId || !type || !date || !description) {
            return res.status(400).json({ message: "Faltan datos obligatorios." });
        }

        // Ejecutar la inserción en la BD
        const [result] = await db.query(
            "INSERT INTO servicios (userId, type, date, availability, description) VALUES (?, ?, ?, ?, ?)",
            [userId, type, date, availability || null, description]
        );

        res.status(201).json({ 
            message: `✅ Servicio '${type}' agregado con éxito.`, 
            serviceId: result.insertId 
        });
    } catch (err) {
        console.error("Error al publicar servicio:", err);
        res.status(500).json({ message: "Error interno al agregar el servicio." });
    }
});

// 2. RUTA GET: Cargar Muro de Servicios
router.get("/", async (req, res) => {
    try {
        // Consulta para obtener servicios y datos del usuario creador (para la función contactarServicio)
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
        
        // Devuelve el JSON con la lista de servicios
        res.json(servicios); 
    } catch (err) {
        console.error("Error al obtener servicios:", err);
        res.status(500).json({ message: "Error interno al cargar servicios." });
    }
});

module.exports = router;