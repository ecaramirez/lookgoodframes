const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("resetEmail");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Reset messages
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    // Validation
    if (email === "") {
        showError("Please enter your email address.");
        return;
    }

    if (!validateEmail(email)) {
        showError("Please enter a valid email address.");
        return;
    }

    // Simulate sending reset link
    setTimeout(() => {
        successMessage.style.display = "block";
        emailInput.value = "";
    }, 800);
});

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = "block";
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}