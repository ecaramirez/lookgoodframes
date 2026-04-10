<?php
require_once '../config.php';
session_start();

if (!isset($_SESSION['email']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../index.php");
    exit();
}

$sql = "
    SELECT 
        orders.id AS order_id,
        users.name AS user_name,
        GROUP_CONCAT(products.name SEPARATOR ', ') AS product_name,
        GROUP_CONCAT(order_items.quantity SEPARATOR ', ') AS quantities,
        orders.full_name,
        orders.total_amount,
        orders.phone,
        orders.province,
        orders.city,
        orders.barangay,
        orders.street,
        orders.created_at,
        orders.payment_method
    FROM orders
    JOIN users ON orders.user_id = users.id
    JOIN order_items ON orders.id = order_items.order_id
    JOIN products ON order_items.product_id = products.id
    GROUP BY 
        orders.id,
        users.name,
        orders.full_name,
        orders.total_amount,
        orders.phone,
        orders.province,
        orders.city,
        orders.barangay,
        orders.street,
        orders.created_at,
        orders.payment_method
    ORDER BY orders.created_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $row['quantities'] = array_map('intval', explode(',', $row['quantities']));
    
    $row['product_name'] = explode(', ', $row['product_name']);
    
    $orders[] = $row;
}

// Return JSON
header('Content-Type: application/json');
echo json_encode($orders);
?>