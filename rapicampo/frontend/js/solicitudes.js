// URL base del backend - CORREGIDO
const API_URL = "";

async function cargarSolicitudes() {
    // 1. Obtener el ID del usuario logueado
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const container = document.getElementById("solicitudesContainer");

    if (!usuario || !usuario.id) {
        container.innerHTML = 
            '<div class="alert alert-warning">Debes iniciar sesión para ver tus solicitudes.</div>';
        return;
    }

    try {
        const userId = usuario.id;
        
        // RUTA CORRECTA: Llama a /api/mis-solicitudes/:userId
        const res = await fetch(`${API_URL}/api/mis-solicitudes/${userId}`); 
        
        if (!res.ok) {
            const errorResult = await res.json(); 
            throw new Error(errorResult.message || `Error al cargar solicitudes: Código ${res.status}`);
        }

        // Leer la respuesta. data puede ser un array o un objeto (si el backend devuelve el mensaje "Aún no has realizado...")
        const data = await res.json();
        
        // CORRECCIÓN CLAVE: Asegura que 'solicitudes' sea un array. 
        // Si la data es un objeto (como {message: ..., data: []}), usa data.data.
        const solicitudes = Array.isArray(data) ? data : (data.data || []); 
        
        container.innerHTML = "";

        if (solicitudes.length === 0) {
            container.innerHTML = `<p class="text-center fw-bold fs-4 text-muted">Aún no has realizado ninguna solicitud.</p>`;
            return;
        }

        let table = `
            <table class="table table-striped shadow-sm">
                <thead>
                    <tr>
                        <th>Servicio Solicitado</th>
                        <th>Ofrecido por</th>
                        <th>Estado</th>
                        <th>Fecha de Solicitud</th>
                    </tr>
                </thead>
                <tbody>
                    ${solicitudes.map(s => {
                        // Interpretación de campos del procedimiento almacenado
                        const badgeClass = s.solicitud_status === "pendiente" ? "warning" : 
                                           s.solicitud_status === "completado" ? "success" : "danger";
                        
                        return `
                            <tr>
                                <td>${s.service_description} (${s.service_type})</td>
                                <td>${s.nombre_creador}</td>
                                <td><span class="badge bg-${badgeClass}">${s.solicitud_status}</span></td>
                                <td>${new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
        container.innerHTML = table;

    } catch (err) {
        console.error("Error al cargar solicitudes:", err);
        container.innerHTML = 
            `<div class="alert alert-danger">Error: No se pudo cargar la lista de solicitudes. ${err.message}</div>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarSolicitudes);