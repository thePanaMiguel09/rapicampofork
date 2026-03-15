// URL base del backend - Correcta
const API_URL = "";

async function cargarHistorial() {
    // 1. Obtener el ID del usuario logueado
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const container = document.getElementById("historialContainer");

    if (!usuario || !usuario.id) {
        container.innerHTML = 
            '<div class="alert alert-warning">Debes iniciar sesión para ver tu historial.</div>';
        return;
    }

    try {
        const userId = usuario.id;
        
        // 2. CORRECCIÓN CLAVE DE URL: Llama a la ruta /api/mis-servicios/
        const res = await fetch(`${API_URL}/api/mis-servicios/${userId}`); 
        
        if (!res.ok) {
            // Intentar leer el mensaje de error JSON del backend
            const errorResult = await res.json(); 
            throw new Error(errorResult.message || `Error al cargar historial: Código ${res.status}`);
        }

        // 3. NO NECESITAS ESTO: El backend ya devuelve los datos del procedimiento almacenado.
        // const historial = await res.json(); 
        
        // CORRECCIÓN DE DATOS: Usamos el mismo GET de mis-servicios, pero como esa ruta está
        // diseñada para mostrar SOLICITUDES RECIBIDAS, no historial de servicios hechos por el usuario.
        // Cambiaremos la lógica para que muestre las solicitudes que el usuario ha RECIBIDO.
        
        const historial = await res.json(); // historial ahora contiene las solicitudes RECIBIDAS
        
        container.innerHTML = "";

        // 4. Se comprueba si el array devuelto está vacío.
        if (historial.length === 0) {
            container.innerHTML = `<p class="text-center fw-bold fs-4 text-muted">Aún no tienes ítems en el historial de solicitudes recibidas.</p>`;
            return;
        }

        // 5. Renderiza los servicios (ahora interpretando como Solicitudes Recibidas)
        historial.forEach(h => {
            // Clases y lógica basadas en el 'status' de la solicitud recibida
            const badgeClass = h.solicitud_status === 'completado' ? 'bg-success' : 
                               h.solicitud_status === 'cancelado' ? 'bg-danger' : 'bg-secondary';
            const statusText = h.solicitud_status || 'Pendiente';
            
            // Los campos 'comment' y 'historial' no vienen de esta ruta, por eso se ajustan.
            
            container.innerHTML += `
                <div class="list-group-item shadow-sm mb-3 p-3 rounded">
                    <h5 class="mb-1">Servicio Publicado: ${h.service_description} (${h.service_type})</h5>
                    <p class="mb-1"><strong>Solicitante:</strong> ${h.nombre_solicitante || 'N/A'} - (${h.telefono_solicitante || 'N/A'})</p>
                    <p class="mb-1"><strong>Estado:</strong> <span class="badge ${badgeClass}">${statusText}</span></p>
                    <p class="text-muted small">Fecha de solicitud: ${new Date(h.solicitud_fecha).toLocaleDateString()}</p>
                </div>
            `;
        });
        
    } catch (err) {
        console.error("Error al cargar historial:", err);
        container.innerHTML = 
            `<div class="alert alert-danger">Error: No se pudo cargar el historial. ${err.message}. Verifica el procedimiento almacenado.</div>`;
    }
}

// Línea crucial para que la función se ejecute al cargar la página.
document.addEventListener("DOMContentLoaded", cargarHistorial);