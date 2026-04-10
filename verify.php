<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['verify_email'])) {
    header("Location: index.php");
    exit();
}

$error = "";

if (isset($_POST['verify'])) {

    $code = $_POST['code'];
    $email = $_SESSION['verify_email'];

    $stmt = $conn->prepare(
        "SELECT verification_code FROM users WHERE email = ?"
    );
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && $user['verification_code'] == $code) {

        $stmt = $conn->prepare(
            "UPDATE users 
            SET is_verified = 1, verification_code = NULL 
            WHERE email = ?"
        );
        $stmt->bind_param("s", $email);
        $stmt->execute();

        unset($_SESSION['verify_email']);

        $_SESSION['login_error'] = "Account verified! You can now login.";
        header("Location: index.php");
        exit();

    } else {
        $error = "Invalid code!";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Verify Account</title>
</head>
<body>

<h2>Email Verification</h2>

<?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>

<form method="post">
    <input type="text" name="code" placeholder="Enter 6-digit code" required>
    <button type="submit" name="verify">Verify</button>
</form>

</body>
</html>