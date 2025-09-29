// REGISTRO (mock Sprint 2)
const formRegistro = document.getElementById("formRegistro");
const rEmail = document.getElementById("rEmail");
const rPass  = document.getElementById("rPass");
const rMsg   = document.getElementById("rMsg");

formRegistro?.addEventListener("submit", (e)=>{
  e.preventDefault();
  rMsg.textContent = "";

  if(!rEmail.checkValidity() || !rPass.checkValidity()){
    rMsg.textContent = "Revisa los campos: email válido y contraseña (min. 6).";
    return;
  }

  if(rEmail.value.trim().toLowerCase() === "ana@example.com"){
    rMsg.textContent = "El email ya está en uso.";
  } else {
    rMsg.textContent = "Registro exitoso.";
  }
});
