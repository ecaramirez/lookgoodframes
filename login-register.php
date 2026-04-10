<?php
session_start();
require_once 'config.php';
// Add to your existing config.php


if (isset($_POST['register'])) {

    $firstName = $_POST['firstname'];
    $lastName  = $_POST['lastname'];
    $username  = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role     = $_POST['role'];

    $checkEmail = $conn->query("SELECT email FROM users WHERE email = '$email'");

    if ($checkEmail->num_rows > 0) {
        $_SESSION['register_error'] = 'Email already exists!';
        $_SESSION['active_form'] = 'register';
    } else {
        $conn->query(
            "INSERT INTO users (first_name, last_name, username, email, password, role)
            VALUES ('$firstName', '$lastName', '$username', '$email', '$password', '$role')"
        );
    }

    header("Location: index.php");
    exit();
}

if (isset($_POST['login'])) {
    $email    = trim($_POST['email']);
    $password = $_POST['password'];

    // --- Static Admin Check (no DB) ---
    if ($email === ADMIN_EMAIL && password_verify($password, ADMIN_PASSWORD)) {
        session_regenerate_id(true);

        $_SESSION['user_id']    = 0; // or any sentinel value
        $_SESSION['first_name'] = 'Admin';
        $_SESSION['last_name']  = '';
        $_SESSION['email']      = ADMIN_EMAIL;
        $_SESSION['role']       = 'admin';

        header("Location: admin/dashboard.php");
        exit();
    }

    // --- Regular User Check (DB) ---
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            session_regenerate_id(true);

            $_SESSION['user_id']    = $user['user_id'];
            $_SESSION['first_name'] = $user['first_name'];
            $_SESSION['last_name']  = $user['last_name'];
            $_SESSION['email']      = $user['email'];
            $_SESSION['role']       = $user['role'];

            $stmt->close();

            $redirect = $_SESSION['redirect_after_login'] ?? null;
            unset($_SESSION['redirect_after_login']);

            if ($redirect && str_starts_with($redirect, '/') && !str_starts_with($redirect, '//')) {
                header("Location: " . $redirect);
            } else {
                header("Location: user/mainpage.php");
            }

            exit();
        }
    }

    $stmt->close();
    $_SESSION['login_error'] = 'Invalid email or password!';
    $_SESSION['active_form'] = 'login';
    header("Location: index.php");
    exit();
}