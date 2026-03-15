// URL base del backend
const API_URL = "";

// ==========================
// REGISTRO
// ==========================
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombres: document.getElementById("nombres").value,
    apellidos: document.getElementById("apellidos").value,
    cc: document.getElementById("cc").value,
    telefono: document.getElementById("telefono").value,
    correo: document.getElementById("correo").value,
    password: document.getElementById("password").value,
  };

  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    alert(result.message || "Usuario registrado");

    if (res.ok) {
      // después de registrarse, limpio el formulario
      document.getElementById("registerForm").reset();

      // si estás usando colapsables de Bootstrap para alternar login/registro
      if (typeof bootstrap !== "undefined") {
        const collapse = new bootstrap.Collapse(
          document.getElementById("registerFormCollapse"),
          { toggle: true }
        );
      }
    }
  } catch (err) {
    console.error("Error en el registro:", err);
    alert("Hubo un error al registrar el usuario");
  }
});

// ==========================
// LOGIN
// ==========================
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    correo: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Bienvenido " + (result.user?.nombres || "Usuario"));

      // Guardamos el correo del usuario en localStorage para simular sesión
      localStorage.setItem("usuario", JSON.stringify(result.user));

      // Redirigimos a la página de servicios
      window.location.href = "servicios.html";
    } else {
      alert(result.message || "Error al iniciar sesión");
    }
  } catch (err) {
    console.error("Error en el login:", err);
    alert("Hubo un error al iniciar sesión");
  }
});
