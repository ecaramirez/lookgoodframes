<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn() {
    return isset($_SESSION['email']) && isset($_SESSION['role']);
}

function isUser() {
    return isLoggedIn() && $_SESSION['role'] === 'user';
}

function requireLogin($redirect = '../index.php') {
    if (!isLoggedIn()) {
        header("Location: $redirect");
        exit();
    }
}

function requireUser($redirect = '../index.php') {
    if (!isUser()) {
        header("Location: $redirect");
        exit();
    }
}
?>