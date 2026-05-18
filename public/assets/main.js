const button = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");

button?.addEventListener("click", () => {
  nav.style.display =
    nav.style.display === "flex" ? "none" : "flex";
});