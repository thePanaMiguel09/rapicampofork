// backend/models/Solicitud.js
const mongoose = require("mongoose");

const SolicitudSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio" },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  status: { type: String, default: "pendiente" }
});

module.exports = mongoose.model("Solicitud", SolicitudSchema);
