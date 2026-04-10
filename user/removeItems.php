<?php
session_start();
require_once '../config.php';

$user_id = $_SESSION['user_id'];
$product_id = $_POST['product_id'];

$stmt = $conn->prepare("DELETE FROM carts WHERE user_id=? AND product_id=?");
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();

header('Location: mainpage.php'); 
exit;
