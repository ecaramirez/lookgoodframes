<?php
require_once '../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// GET - list all products
if ($method === 'GET') {
    $products = [];
    $res = $conn->query("SELECT product_id, name, description, price, stock, category, image, status FROM products ORDER BY product_id DESC");
    while ($row = $res->fetch_assoc()) {
        $row['id']    = (string)$row['product_id'];
        $row['price'] = (float)$row['price'];
        $row['stock'] = (int)$row['stock'];
        $row['image'] = $row['image'] ? '../uploads/products/' . $row['image'] : '';
        $products[]   = $row;
    }
    echo json_encode($products);
    exit();
}

// POST - update inventory (stock + price)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id    = trim($input['id'] ?? '');
    $stock = (int)($input['stock'] ?? 0);
    $price = (float)($input['price'] ?? 0);

    if (!$id) { echo json_encode(['error' => 'Invalid ID']); exit(); }

    $status = $stock === 0 ? 'inactive' : 'active';
    $stmt = $conn->prepare("UPDATE products SET stock = ?, price = ?, status = ? WHERE product_id = ?");
    $stmt->bind_param('idss', $stock, $price, $status, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>
