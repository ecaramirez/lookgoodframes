// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ----- PASSWORD TOGGLE (show/hide) -----
    const toggleButtons = document.querySelectorAll('.toggle-pw');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye-slash');
                    icon.classList.toggle('fa-eye');
                }
            }
        });
    });

    // ----- FORM VALIDATION + reCAPTCHA CHECK -----
    const form = document.getElementById('signupForm');
    const feedbackDiv = document.getElementById('formFeedback');
    const errorSpan = document.getElementById('errorText');

    function showError(msg) {
        errorSpan.innerText = msg;
        feedbackDiv.classList.add('show');
        // Auto-hide after 4 seconds
        setTimeout(() => {
            feedbackDiv.classList.remove('show');
        }, 4000);
    }

    function clearError() {
        feedbackDiv.classList.remove('show');
        errorSpan.innerText = '';
    }

    // reCAPTCHA checker (Google test key always returns grecaptcha.getResponse() as non-empty if user clicks)
    function isRecaptchaValid() {
        if (typeof grecaptcha !== 'undefined') {
            const response = grecaptcha.getResponse();
            return response && response.length > 0;
        }
        // fallback if reCAPTCHA not loaded yet
        return false;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();  // prevent actual navigation until validation passes

        clearError();

        // Get field values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('passwordReg').value;
        const confirm = document.getElementById('confirmReg').value;

        fetch('login-register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&confirmPassword=${encodeURIComponent(confirm)}`
        });

        // Basic checks
        if (!firstName || !lastName || !email || !username || !password || !confirm) {
            showError('All fields are required.');
            return;
        }

        // Email simple validation
        const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showError('Please enter a valid email address (e.g., name@example.com).');
            return;
        }

        // Username: at least 3 characters, letters/numbers/underscore
        const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernamePattern.test(username)) {
            showError('Username must be 13–18 characters (letters, numbers, underscore only).');
            return;
        }

        // Password strength: min 6 chars
        if (password.length < 6) {
            showError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirm) {
            showError('Passwords do not match.');
            return;
        }

        // reCAPTCHA validation
        if (!isRecaptchaValid()) {
            showError('Please verify that you are not a robot (reCAPTCHA).');
            return;
        }

        // If all valid, proceed to redirect (action="../Login/login.html")
        // You can also add a success message before redirect
        // For demo, we redirect after a short delay
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Signing up...';
        submitBtn.disabled = true;

        // Simulate a tiny delay to show feedback (optional)
        setTimeout(() => {
            // Redirect to login page as per form action
            window.location.href = form.action;
        }, 300);
    });

    // ----- GO BACK BUTTON (enhanced with fallback) -----
    const goBackBtn = document.getElementById('goBackBtn');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // If there's a previous page in history, go back; otherwise go to homepage
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '../Homepage/index.html';
            }
        });
    }
});