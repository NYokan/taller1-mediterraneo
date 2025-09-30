// Referencias a los modales
const registroModal = document.getElementById("registroModal");
const loginModal = document.getElementById("loginModal");

// Referencias a enlaces de navbar
const registroLink = document.querySelector('a[href="#registro"]');
const loginLink = document.querySelector('a[href="#login"]');

// Botones de cierre
const closeBtns = document.querySelectorAll(".close");

// --- Abrir modales ---
if (registroLink) {
  registroLink.addEventListener("click", (e) => {
    e.preventDefault();
    registroModal.style.display = "flex";
  });
}

if (loginLink) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "flex";
  });
}

// --- Cerrar modales con botón ---
closeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    registroModal.style.display = "none";
    loginModal.style.display = "none";
  });
});

// --- Cerrar modales clic afuera ---
window.onclick = function(event) {
  if (event.target === registroModal) registroModal.style.display = "none";
  if (event.target === loginModal) loginModal.style.display = "none";
};

// --- Validaciones Mock ---
// Registro
const registroForm = registroModal.querySelector("form");
registroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = registroForm.querySelector('input[type="email"]').value;
  const password = registroForm.querySelector('input[type="password"]').value;

  if (email === "test@example.com") {
    alert("El email ya está en uso");
  } else if (password.length < 6) {
    alert("La contraseña no cumple los requisitos");
  } else {
    alert("Registro exitoso");
    registroModal.style.display = "none";
    registroForm.reset();
  }
});

// Login
const loginForm = loginModal.querySelector("form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  if (email !== "test@example.com" || password !== "123456") {
    alert("Credenciales inválidas");
  } else {
    alert("Inicio de sesión correcto");
    loginModal.style.display = "none";
    loginForm.reset();
  }
});
