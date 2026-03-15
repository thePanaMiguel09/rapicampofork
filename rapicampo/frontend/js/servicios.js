// URL base del backend - Correcta
const API_URL = "";

// ==========================
// 1. Publicar "Voy al pueblo" (Oferta)
// ==========================
document.getElementById("offerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return alert("Debes iniciar sesión");

    const data = {
        userId: usuario.id,
        type: "oferta",
        date: document.getElementById("dateOffer").value,
        availability: document.getElementById("availabilityOffer").value,
        description: document.getElementById("detailsOffer").value
    };

    try {
        // RUTA CORRECTA: POST /api/services
        const res = await fetch(`${API_URL}/api/services`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message || "Disponibilidad publicada con éxito");
            document.getElementById("offerForm").reset();
            cargarServicios();
        } else {
            alert(result.message || `Error al publicar oferta: Código ${res.status}`);
        }
    } catch (err) {
        console.error("Error en la publicación:", err);
        alert(`Hubo un error al contactar el servidor: ${err.message || 'Error de conexión.'}`);
    }
});

// ==========================
// 2. Publicar "Necesito servicio" (Necesidad) - ¡FUNCIÓN FALTANTE!
// ==========================
document.getElementById("needForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return alert("Debes iniciar sesión");

    const data = {
        userId: usuario.id,
        type: "necesidad", // Valor fijo para "Necesito servicio"
        date: document.getElementById("dateNeed").value,
        description: document.getElementById("detailsNeed").value
    };

    try {
        // RUTA CORRECTA: POST /api/services
        const res = await fetch(`${API_URL}/api/services`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message || "Solicitud publicada con éxito");
            document.getElementById("needForm").reset(); // Limpiar formulario
            cargarServicios();
        } else {
            alert(result.message || `Error al publicar necesidad: Código ${res.status}`);
        }
    } catch (err) {
        console.error("Error en la publicación de necesidad:", err);
        alert(`Hubo un error al contactar el servidor: ${err.message || 'Error de conexión.'}`);
    }
});

// ==========================
// 3. Cargar muro de servicios (GET /api/services)
// ==========================
async function cargarServicios() {
    const res = await fetch(`${API_URL}/api/services`);
    const servicios = await res.json();

    const container = document.getElementById("servicesWall");
    container.innerHTML = "";

    servicios.forEach(s => {
        // Iconos dinámicos según tipo de servicio
        let iconLeft = s.type === "oferta" ? "🚜" : "📣";   // oferta vs necesidad
        let iconRight = s.type === "oferta" ? "🛒" : "🤝";

        container.innerHTML += `
      <div class="col-md-6">
        <div class="card servicio-card shadow-sm p-3">
        
          <!-- Icono en esquina izquierda -->
          <span class="icono-servicio icon-left">${iconLeft}</span>

          <!-- Icono en esquina derecha -->
          <span class="icono-servicio icon-right">${iconRight}</span>

          <h5 class="mt-3">${s.description}</h5>
          <p>Fecha: ${s.date || "N/A"}</p>

          ${s.availability ? `<p>Horario: ${s.availability}</p>` : ""}

<button class="btn btn-outline-dark btn-sm" onclick="contactarServicio(${s.id})">
  Contactar
</button>

        </div>
      </div>`;
    });
}


// ==========================
// 4. Contactar un servicio - ¡FUNCIÓN FALTANTE!
// ==========================
async function contactarServicio(servicioId, nombreContacto, telefonoContacto, correoContacto) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return alert("Debes iniciar sesión");

    // Muestra la info de contacto al usuario
    alert(`Información de contacto para ${nombreContacto}:\n\nTeléfono: ${telefonoContacto}\nCorreo: ${correoContacto}`);

    try {
        // RUTA REQUERIDA: POST /api/requests (Necesita que la crees en el backend)
        const res = await fetch(`${API_URL}/api/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId: servicioId, userId: usuario.id })
        });

        const result = await res.json();

        if (res.ok) {
            alert("✅ Solicitud de contacto registrada con éxito en el servidor.");
        } else {
            alert(result.message || `Error al contactar servicio: Código ${res.status}`);
        }
    } catch (err) {
        console.error("Error al registrar solicitud de contacto:", err);
        alert("Error de conexión. Verifica la ruta POST /api/requests.");
    }
}

// ==========================
// 5. Cargar servicios al entrar - ¡LÍNEA CRÍTICA!
// ==========================
document.addEventListener("DOMContentLoaded", cargarServicios);