<?php
require_once '../config.php';

$id = $_GET['id'] ?? '';
$stmt = $conn->prepare("SELECT product_id FROM products WHERE product_id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$stmt->store_result();

echo json_encode(['exists' => $stmt->num_rows > 0]);
?>