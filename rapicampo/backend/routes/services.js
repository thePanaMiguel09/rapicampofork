const express = require("express");
const router = express.Router();

let servicios = []; // memoria

router.post("/", (req, res) => {
  const { type, date, availability, description, userId } = req.body;
  const nuevo = { id: servicios.length + 1, type, date, availability, description, userId };
  servicios.push(nuevo);
  res.json({ message: "Servicio agregado", servicio: nuevo });
});

router.get("/", (req, res) => res.json(servicios));

module.exports = router;
