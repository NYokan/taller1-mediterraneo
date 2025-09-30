// --- Navbar: mostrar menú ---
const menuLink = document.getElementById("menuLink");
const menuSection = document.getElementById("menu");

menuLink.addEventListener("click", (e) => {
  e.preventDefault();
  menuSection.classList.toggle("hidden");
  menuSection.scrollIntoView({ behavior: "smooth" });
});

// --- Modales ---
const registroModal = document.getElementById("registroModal");
const loginModal = document.getElementById("loginModal");
const closeBtns = document.querySelectorAll(".close");

// Cerrar modales con botón X
closeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    registroModal.style.display = "none";
    loginModal.style.display = "none";
  });
});

// Cerrar modales clic afuera
window.onclick = function(event) {
  if (event.target === registroModal) registroModal.style.display = "none";
  if (event.target === loginModal) loginModal.style.display = "none";
};

// --- Abrir Login desde navbar (USUARIO) ---
const usuarioLink = document.getElementById("usuarioLink");
usuarioLink?.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.style.display = "flex";
});

// --- Pasar de Login a Registro ---
const goToRegistro = document.getElementById("goToRegistro");
goToRegistro?.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.style.display = "none";
  registroModal.style.display = "flex";
});

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
    alert("La contraseña debe tener al menos 6 caracteres");
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
