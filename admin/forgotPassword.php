<?php
session_start();

require_once '../config.php';
require_once '../auth_admin.php';

if (!isset($_SESSION['email']) ||!isset($_SESSION['role']) ||$_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Forgot Password | Look Good Frames</title>
    <link rel="stylesheet" href="../css/Admin/forgotpass.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

<div class="forgot-container">
    <div class="forgot-card">

        <div class="logo-icon">
            <img src="../uploads/logo/lookgood-black.png" alt="look good logo" class="logo-img">
        </div>

        <h2 class="forgot-title">Forgot Password</h2>
        <p class="forgot-subtitle">
            Enter your email and we'll send you a reset link.
        </p>

        <form id="forgotForm" class="forgot-form">

            <div class="error-message" id="errorMessage">
                <i class="fas fa-exclamation-circle"></i>
                <span id="errorText"></span>
            </div>

            <div class="success-message" id="successMessage">
                <i class="fas fa-check-circle"></i>
                Password reset link sent successfully!
            </div>

            <div class="form-group">
                <label for="resetEmail">Email Address</label>
                <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon"></i>
                    <input
                        type="email"
                        id="resetEmail"
                        placeholder="admin@lookgoodframes.com"
                        autocomplete="email"
                    >
                </div>
            </div>

            <button type="submit" class="reset-button" id="resetButton">
                <span id="buttonText">Send Reset Link</span>
                <i class="fas fa-paper-plane"></i>
            </button>
        </form>

        <div class="back-to-login">
            <a href="../login/login.html">
                <i class="fas fa-arrow-left"></i> Back to Login
            </a>
        </div>

    </div>
</div>

<script src="../adminActions/forgotPass.js"></script>
</body>
</html>