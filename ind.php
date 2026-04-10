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
    <title>LookGood — Log In</title>
    <link rel="stylesheet" href="login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>

<body class="top">
    <div class="page">
    <!-- LEFT SIDE: BRAND SECTION -->
    <div class="brand-section">
        <div class="brand-content">
            <a href="../Homepage/index.html#top">
                <img src="../Resources/Logos/lookgood-black.png" class="brand-logo" alt="LookGood logo" onerror="this.src='https://placehold.co/400x120?text=LookGood'">
            </a>
            <p class="brand-tagline">Looking good has never been this clear.</p>
        </div>
    </div>

    <!-- RIGHT SIDE: LOGIN FORM -->
    <div class="login-section" <?= isActiveForm('login', $activeForm); ?>>
    <div class="login-box">
        <h2 class="login-title">Welcome back!</h2>
        <p class="login-subtitle">Log in to your LookGood account</p>

        <form id="loginForm" action="login-register.php" method="POST" novalidate>
        <div class="float-group">
            <input type="text" class="float-input" id="emailOrUsername" name="emailOrUsername" placeholder=" " required autocomplete="username">
            <label class="float-label">Email or Username</label>
        </div>

        <div class="float-group">
            <input type="password" class="float-input" id="password" name="password" placeholder=" " required autocomplete="current-password">
            <label class="float-label">Password</label>
            <button type="button" class="toggle-pw" id="togglePassword" aria-label="Show password">
            <i class="fas fa-eye-slash"></i>
            </button>
        </div>

        <div class="login-options">
            <label class="remember-me">
            <input type="checkbox" name="remember"> Remember me
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <div id="formFeedback" class="error-message">
            <i class="fas fa-circle-exclamation"></i>
            <span id="errorText"></span>
        </div>

        <button type="submit" class="loginbtn">Log In</button>

        <div class="separator">
            <hr><span>Don't have an account yet?</span>
            <hr>
        </div>

        <a href="../Register/register.html" class="signup-link-btn">Create an Account</a>

        <!-- ENHANCED GO BACK BUTTON (same style as register) -->
        <div class="back-link-container">
            <a href="../Homepage/index.html#top" class="go-back-link" id="goBackBtn">
            <i class="fas fa-arrow-left"></i> Go back
            </a>
        </div>
        </form>
    </div>
    </div>
</div>
<script src="login.js"></script>
</body>

</html>