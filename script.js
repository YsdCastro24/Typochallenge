import { initGame } from "./gameLogic.js";

const themeToggleButton = document.getElementById("theme-toggle");

// actualizar el tema y el ícono
function updateTheme() {
  if (document.body.classList.contains("light-theme")) {
    themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem("theme", "light");
  } else {
    themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", "dark");
  }
}

function initkeyboardVisibility() {
  const $virtualKeyboard = document.getElementById("virtual-keyboard");
  if (window.innerWidth > 768) {
    $virtualKeyboard.style.display = "flex";
  } else {
    $virtualKeyboard.style.display = "none";
  }
}

// tema guardado en localStorage
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-theme");
} else {
  document.body.classList.remove("light-theme");
}

// ícono correcto al cargar la página
updateTheme();

themeToggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  updateTheme();
});

initGame();
initkeyboardVisibility();
