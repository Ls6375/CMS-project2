// Burger menu functionality
const burgerMenu = document.querySelector(".burger-menu");
const navLinks = document.querySelector(".nav-links");

burgerMenu.addEventListener("click", () => {
  burgerMenu.classList.toggle("active");
  navLinks.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navLinks.contains(e.target) && !burgerMenu.contains(e.target)) {
    burgerMenu.classList.remove("active");
    navLinks.classList.remove("active");
  }
});