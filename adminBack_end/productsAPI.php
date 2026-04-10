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

function ensureAdminNotificationsTable(mysqli $conn): void {
    $conn->query(
        "CREATE TABLE IF NOT EXISTS admin_notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(30) NOT NULL DEFAULT 'status',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            data_json TEXT NULL,
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"
    );
}

function createStockNotification(mysqli $conn, string $productId, string $productName, int $stock): void {
    $type = 'stock';
    $title = $stock === 0 ? 'Out of Stock' : 'Low Stock Alert';
    $message = $stock === 0
        ? ($productName . ' (' . $productId . ') is now out of stock.')
        : ($productName . ' (' . $productId . ') is low on stock: ' . $stock . ' remaining.');
    $dataJson = json_encode([
        'productId' => $productId,
        'stock' => $stock,
    ]);

    // Prevent duplicate unread alerts for the same product and exact stock value.
    $dupStmt = $conn->prepare(
        "SELECT id FROM admin_notifications
         WHERE type = 'stock'
           AND is_read = 0
           AND data_json = ?
         ORDER BY id DESC
         LIMIT 1"
    );
    if ($dupStmt) {
        $dupStmt->bind_param('s', $dataJson);
        $dupStmt->execute();
        $dupStmt->store_result();
        if ($dupStmt->num_rows > 0) {
            $dupStmt->close();
            return;
        }
        $dupStmt->close();
    }

    $stmt = $conn->prepare(
        'INSERT INTO admin_notifications (type, title, message, data_json, is_read) VALUES (?, ?, ?, ?, 0)'
    );
    if ($stmt) {
        $stmt->bind_param('ssss', $type, $title, $message, $dataJson);
        $stmt->execute();
        $stmt->close();
    }
}

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
    $ok = $stmt->execute();

    if (!$ok) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product']);
        exit();
    }

    if ($stock < 15) {
        $productName = $id;
        $nameStmt = $conn->prepare('SELECT name FROM products WHERE product_id = ? LIMIT 1');
        if ($nameStmt) {
            $nameStmt->bind_param('s', $id);
            $nameStmt->execute();
            $nameStmt->bind_result($fetchedName);
            if ($nameStmt->fetch() && !empty($fetchedName)) {
                $productName = (string)$fetchedName;
            }
            $nameStmt->close();
        }

        ensureAdminNotificationsTable($conn);
        createStockNotification($conn, $id, $productName, $stock);
    }

    echo json_encode(['success' => true]);
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>
