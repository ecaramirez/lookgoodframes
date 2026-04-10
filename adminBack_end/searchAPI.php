<?php
require_once __DIR__ . '/../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

$query = trim((string)($_GET['q'] ?? ''));
if ($query === '') {
    echo json_encode(['results' => []]);
    exit();
}

$like = '%' . $query . '%';
$results = [];

// Orders
$orderStmt = $conn->prepare(
    "SELECT order_id, full_name, total_amount
     FROM checkout
     WHERE CAST(order_id AS CHAR) LIKE ? OR full_name LIKE ?
     ORDER BY order_id DESC
     LIMIT 5"
);
if ($orderStmt) {
    $orderStmt->bind_param('ss', $like, $like);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    if ($orderResult) {
        while ($row = $orderResult->fetch_assoc()) {
            $results[] = [
                'type' => 'Order',
                'label' => '#' . (string)$row['order_id'] . ' - ' . ((string)$row['full_name'] !== '' ? (string)$row['full_name'] : 'Customer'),
                'sublabel' => 'Total ' . number_format((float)$row['total_amount'], 2),
                'href' => 'orders.php?source=search&orderId=' . urlencode((string)$row['order_id'])
            ];
        }
    }
    $orderStmt->close();
}

// Products
$productStmt = $conn->prepare(
    "SELECT product_id, name, category, price
     FROM products
     WHERE product_id LIKE ? OR name LIKE ? OR category LIKE ?
     ORDER BY product_id DESC
     LIMIT 5"
);
if ($productStmt) {
    $productStmt->bind_param('sss', $like, $like, $like);
    $productStmt->execute();
    $productResult = $productStmt->get_result();
    if ($productResult) {
        while ($row = $productResult->fetch_assoc()) {
            $results[] = [
                'type' => 'Product',
                'label' => (string)$row['name'] . ' (' . (string)$row['product_id'] . ')',
                'sublabel' => ucfirst((string)$row['category']) . ' - P' . number_format((float)$row['price'], 2),
                'href' => 'product.php?source=search&tab=products&productId=' . urlencode((string)$row['product_id'])
            ];
        }
    }
    $productStmt->close();
}

// Users
$userStmt = $conn->prepare(
    "SELECT user_id, first_name, last_name, email
     FROM users
     WHERE role = 'user'
       AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?)
     ORDER BY user_id DESC
     LIMIT 5"
);
if ($userStmt) {
    $userStmt->bind_param('ssss', $like, $like, $like, $like);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    if ($userResult) {
        while ($row = $userResult->fetch_assoc()) {
            $fullName = trim((string)$row['first_name'] . ' ' . (string)$row['last_name']);
            $results[] = [
                'type' => 'User',
                'label' => $fullName !== '' ? $fullName : ('User #' . (string)$row['user_id']),
                'sublabel' => (string)$row['email'],
                'href' => 'users.php?source=search&userId=' . urlencode((string)$row['user_id'])
            ];
        }
    }
    $userStmt->close();
}

echo json_encode(['results' => $results]);
?>