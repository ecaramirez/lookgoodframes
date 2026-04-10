<?php
session_start();
require_once '../config.php';

if(!isset($_SESSION['user_id'])){
    header('Location: ../index.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$product_id = (int) $_POST['product_id'];
$quantity = (int) $_POST['quantity'];

$stmt = $conn->prepare("SELECT quantity FROM carts WHERE user_id=? AND product_id=?");
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0){
    $row = $result->fetch_assoc();
    $newQty = $row['quantity'] + $quantity;

    $update = $conn->prepare("UPDATE carts SET quantity=? WHERE user_id=? AND product_id=?");
    $update->bind_param("iii", $newQty, $user_id, $product_id);
    $update->execute();
} else {
    $insert = $conn->prepare("INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)");
    $insert->bind_param("iii", $user_id, $product_id, $quantity);
    $insert->execute();
}

header('Location: shop.php');
exit;
?>
