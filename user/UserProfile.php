<?php

session_start();
if (!isset($_SESSION['name']) || !isset($_SESSION['email'])) {
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="css/profile.css"/>
</head>
<body>
    
    <section class="profile-info">
        <h2>Welcome, <?= htmlspecialchars($_SESSION['name'] ?? 'Guest'); ?>!</h2>
        <p>Email: <?= htmlspecialchars($_SESSION['email'] ?? 'Not logged in'); ?></p>
            <header>
        <h1>User Profile</h1>
        <nav>
            <a href="mainpage.php">HOME</a>
            <a href="../logout.php">LOGOUT</a>
            <a href="orders.php">ORDERS</a>
        </nav>
            </header>
    </section>
</body>
</html>