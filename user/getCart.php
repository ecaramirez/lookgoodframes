<?php
session_start();
header('Content-Type: application/json');

$cart = $_SESSION['cart'] ?? [];
echo json_encode($cart);
?>