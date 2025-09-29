// Router básico
const sections = ["home", "menu"];
function route() {
  const target = location.hash.replace("#", "") || "home";
  sections.forEach(id => {
    document.getElementById(id)?.classList.toggle("is-active", id === target);
  });
  document.querySelectorAll('.nav__links a').forEach(a => {
    a.classList.toggle('is-active', a.getAttribute('href') === '#' + target);
  });
}
window.addEventListener("hashchange", route);
route();

// Navbar burger
const burger = document.getElementById("btnBurger");
const mainNav = document.getElementById("mainNav");
burger?.addEventListener("click", () => {
  mainNav.classList.toggle("is-open");
});

// Modal control
function openModal(id) {
  document.getElementById(id).classList.add("show");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

document.querySelector('a[href="#registro"]')?.addEventListener("click", e => {
  e.preventDefault();
  openModal("modalRegistro");
});
document.querySelector('a[href="#login"]')?.addEventListener("click", e => {
  e.preventDefault();
  openModal("modalLogin");
});
document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    closeModal(btn.dataset.close);
  });
});

// US01 Registro
const formRegistro = document.getElementById("formRegistro");
formRegistro?.addEventListener("submit", (e) => {
  e.preventDefault();
  const rEmail = document.getElementById("rEmail");
  const rPass  = document.getElementById("rPass");
  const rMsg   = document.getElementById("rMsg");
  rMsg.textContent = "";

  if (!rEmail.checkValidity() || !rPass.checkValidity()) {
    rMsg.textContent = "Revisa los campos: email válido y contraseña (min. 6).";
    rMsg.classList.add("error");
    return;
  }

  if (rEmail.value.trim().toLowerCase() === "ana@example.com") {
    rMsg.textContent = "El email ya está en uso.";
    rMsg.classList.add("error");
  } else {
    rMsg.textContent = "Registro exitoso.";
    rMsg.classList.add("success");
  }
});

// US02 Login
const formLogin = document.getElementById("formLogin");
formLogin?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const lEmail = document.getElementById("lEmail");
  const lPass  = document.getElementById("lPass");
  const lMsg   = document.getElementById("lMsg");
  lMsg.textContent = "";

  if (!lEmail.checkValidity() || !lPass.checkValidity()) {
    lMsg.textContent = "Ingresa un email válido y contraseña.";
    lMsg.classList.add("error");
    return;
  }

  const ok = lEmail.value.trim().toLowerCase() === "admin@mediterraneo.cl" && lPass.value === "123456";
  if (ok) {
    lMsg.textContent = "Inicio de sesión correcto. Redirigiendo…";
    lMsg.classList.add("success");
  } else {
    lMsg.textContent = "Credenciales inválidas.";
    lMsg.classList.add("error");
  }
});

// US03 Menú
const menuGrid = document.getElementById("menuGrid");
const menuMsg  = document.getElementById("menuMsg");

const productosMock = [
  { id: "p1", name: "Hummus clásico", price: 3500, img: "img/hummus.png", icon: "🥙" },
  { id: "p2", name: "Falafel (6 uds)", price: 4200, img: "img/falafel.png", icon: "🧆" },
  { id: "p3", name: "Shawarma de pollo", price: 5200, img: "img/mediterrraneo.png", icon: "🌯" },
];

function renderMenu(list) {
  menuGrid.innerHTML = "";
  if (!list.length) {
    menuMsg.textContent = "No hay productos disponibles";
    return;
  }
  menuMsg.textContent = "";
  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="thumb">
      <strong>${p.icon} ${p.name}</strong>
      <div class="muted">${p.price.toLocaleString("es-CL",{style:"currency",currency:"CLP"})}</div>
      <button class="btn ghost" disabled>Agregar (Sprint 3)</button>
    `;
    menuGrid.appendChild(card);
  });
}

renderMenu(productosMock);
