<?php
include '../config.php';
session_start();
if (!isset($_SESSION['email']) || $_SESSION['role'] !== 'user') {
    header("Location: ../index.php");
    exit();
}
include '../messages/inbox.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <a href = "chat.php?user_id=<?php echo $_SESSION['email']; ?>">Back to Chats</a>
    <a href = "mainpage.php">mainpage</a>
</body>
</html>