// backend/models/Historial.js
const mongoose = require("mongoose");

const HistorialSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  status: { type: String, default: "pendiente" },
  comment: { type: String, default: "" }
});

module.exports = mongoose.model("Historial", HistorialSchema);
