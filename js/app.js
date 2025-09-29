// ==========================
// NAVBAR RESPONSIVE
// ==========================
const btnBurger = document.getElementById("btnBurger");
const mainNav = document.getElementById("mainNav");

btnBurger.addEventListener("click", () => {
  mainNav.classList.toggle("active");
  btnBurger.classList.toggle("open");
});

// ==========================
// FUNCIONES DE MODALES
// ==========================
function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// Botón "X" en cada modal
document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    const modalId = btn.getAttribute("data-close");
    closeModal(modalId);
  });
});

// Cerrar modal haciendo clic fuera
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// Cerrar modal con tecla ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach(modal => {
      modal.classList.remove("active");
    });
  }
});

// ==========================
// VALIDACIONES SIMPLES (mock)
// ==========================

// Validación registro
const formRegistro = document.querySelector("#modalRegistro form");
if (formRegistro) {
  formRegistro.addEventListener("submit", e => {
    e.preventDefault();
    const email = formRegistro.querySelector("input[type='email']").value;
    const pass = formRegistro.querySelector("input[type='password']").value;

    if (!email.includes("@")) {
      alert("El email no es válido.");
      return;
    }
    if (pass.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    alert("✅ Registro exitoso (mock).");
    closeModal("modalRegistro");
  });
}

// Validación login
const formLogin = document.querySelector("#modalLogin form");
if (formLogin) {
  formLogin.addEventListener("submit", e => {
    e.preventDefault();
    const email = formLogin.querySelector("input[type='email']").value;
    const pass = formLogin.querySelector("input[type='password']").value;

    if (email === "" || pass === "") {
      alert("Por favor completa todos los campos.");
      return;
    }
    alert("✅ Login exitoso (mock).");
    closeModal("modalLogin");
  });
}
