<?php
session_start();

$errors = [
    'login' => $_SESSION['login_error'] ?? '',
    'register' => $_SESSION['register_error'] ?? ''
];

$activeForm = $_SESSION['active_form'] ?? 'login';

session_unset();

function showError($error) {
    return !empty($error) ? "<p class='error-message'>$error</p>" : '';
}

function isActiveForm($formName, $activeForm) {
    return $formName === $activeForm ? 'active' : '';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>LookGood — Create Account</title>
    <link rel="stylesheet" href="register.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>
<body>
<div class="page">
    <!-- LEFT: SIGNUP FORM -->
    <div class="login-section">
        <div class="login-box">
            <h2 class="login-title">Create account</h2>
            <p class="login-subtitle">Join LookGood & find your perfect frame</p>

            <form id="signupForm"  method="POST" novalidate>

                <input type="hidden" name="register" value="1">
                <div class="name-fields">
                    <div class="float-group">
                        <input type="text" class="float-input" id="firstName" name="firstName" placeholder=" " required autocomplete="given-name">
                        <label class="float-label">First name</label>
                    </div>
                    <div class="float-group">
                        <input type="text" class="float-input" id="lastName" name="lastName" placeholder=" " required autocomplete="family-name">
                        <label class="float-label">Last name</label>
                    </div>
                </div>

                <div class="float-group">
                    <input type="email" class="float-input" id="email" name="email" placeholder=" " required autocomplete="email">
                    <label class="float-label">Email address</label>
                </div>

                <div class="float-group">
                    <input type="text" class="float-input" id="username" name="username" placeholder=" " required autocomplete="username">
                    <label class="float-label">Username</label>
                </div>

                <div class="float-group">
                    <input type="password" class="float-input" id="passwordReg" name="password" placeholder=" " required autocomplete="new-password">
                    <label class="float-label">Password</label>
                    <button type="button" class="toggle-pw" data-target="passwordReg" aria-label="Show password">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                </div>

                <div class="float-group">
                    <input type="password" class="float-input" id="confirmReg" name="confirmPassword" placeholder=" " required autocomplete="off">
                    <label class="float-label">Confirm password</label>
                    <button type="button" class="toggle-pw" data-target="confirmReg" aria-label="Show password">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                </div>

                <!-- Google reCAPTCHA v2 - test key -->
                <div class="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>

                <div id="formFeedback" class="error-message">
                    <i class="fas fa-circle-exclamation"></i>
                    <span id="errorText"></span>
                </div>

                <button type="submit" class="loginbtn">Sign Up</button>

                <div class="separator">
                    <hr><span>Already have an account?</span><hr>
                </div>

                <a href="../Login/login.html" class="signup-link-btn">Log In</a>

                <!-- GO BACK BUTTON AT BOTTOM -->
                <div class="back-link-container">
                    <a href="../Homepage/index.html#top" class="go-back-link" id="goBackBtn">
                        <i class="fas fa-arrow-left"></i> Go back
                    </a>
                </div>
            </form>
        </div>
    </div>

    <div class="brand-section">
        <div class="brand-content">
            <a href="../Homepage/index.html">
                <img src="../Resources/Logos/lookgood-black.png" class="brand-logo" alt="LookGood logo" onerror="this.src='https://placehold.co/400x120?text=LookGood'">
            </a>
            <p class="brand-tagline">Looking good has never been this clear.</p>
        </div>
    </div>
</div>

<script src="register.js"></script>
</body>
</html>