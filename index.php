<?php
session_start();

$errors = [
    'login' => $_SESSION['login_error'] ?? '',
    'register' => $_SESSION['register_error'] ?? ''
];

$activeForm = $_SESSION['active_form'] ?? 'login';

// Only clear the flash messages, not the whole session
unset($_SESSION['login_error'], $_SESSION['register_error'], $_SESSION['active_form']);

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
    <title>Login / Register</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="container">

    <div class="form-box <?= isActiveForm('login', $activeForm); ?>" id="login-box">
        <form action="login-register.php" method="post">
            <h2>Login</h2>
            <?= showError($errors['login']); ?>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" name="login">Login</button>
            <p>Don't have an account?
                <a href="#" onclick="showForm('register-box')">Register</a>
            </p>
        </form>
    </div>

    <div class="form-box <?= isActiveForm('register', $activeForm); ?>" id="register-box">
        <form action="login-register.php" method="post">
            <h2>Register</h2>
            <?= showError($errors['register']); ?>
            <input type="text" name="firstname" placeholder="First Name" required>
            <input type="text" name = "lastname" placeholder = "Last Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="text" name = "username" placeholder = "Username" required>
            <input type="password" name="password" placeholder="Password" required>

            <select name="role" required>
                <option value="">--Select Role--</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            <button type="submit" name="register">Register</button>

            <p>Already have an account?
                <a href="#" onclick="showForm('login-box')">Login</a>
            </p>
        </form>
    </div>

</div>

<script src="Actions/function.js"></script>
</body>
</html>