<?php
require_once '../config.php';
require_once 'auth.php';

requireAdmin();

$id = $_GET['id'];

$result = $conn->query("SELECT image FROM products WHERE id=$id");
$row = $result->fetch_assoc();
if($row['image'] && file_exists('../uploads/products/'.$row['image'])) {
    unlink('../uploads/products/'.$row['image']);
}

$conn->query("DELETE FROM products WHERE id=$id");

header("Location: manage_product.php");
exit();
?>