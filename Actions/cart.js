const cartLink = document.getElementById("cartLink");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");

cartLink.addEventListener("click", () => {
    cartPanel.classList.add("open");
    overlay.classList.add("show");
});

closeCart.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);

function closeCartPanel() {
    cartPanel.classList.remove("open");
    overlay.classList.remove("show");
}
