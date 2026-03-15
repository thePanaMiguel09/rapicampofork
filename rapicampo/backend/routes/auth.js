const express = require("express");
const router = express.Router();
const db = require("../server");

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombres, apellidos, cc, telefono, correo, password } = req.body;

    // Validar campos
    if (!nombres || !apellidos || !cc || !telefono || !correo || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Insertar usuario
    const [result] = await db.query(
      "INSERT INTO usuarios (nombres, apellidos, cc, telefono, correo, password) VALUES (?, ?, ?, ?, ?, ?)",
      [nombres, apellidos, cc, telefono, correo, password]
    );

    res.json({ message: "Usuario registrado con éxito", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [rows] = await db.query(
      "SELECT id, nombres, apellidos, correo FROM usuarios WHERE correo = ? AND password = ?",
      [correo, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];
    res.json({ message: "Login exitoso", user, token: "fake-token-" + user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en login" });
  }
});

module.exports = router;
