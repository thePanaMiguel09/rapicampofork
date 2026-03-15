const express = require("express");
const router = express.Router();

let historial = []; // memoria

router.post("/", (req, res) => {
  const { serviceId, userId, status, comment } = req.body;
  const nuevo = { id: historial.length + 1, serviceId, userId, status, comment };
  historial.push(nuevo);
  res.json({ message: "Historial agregado", registro: nuevo });
});

router.get("/", (req, res) => res.json(historial));

module.exports = router;
