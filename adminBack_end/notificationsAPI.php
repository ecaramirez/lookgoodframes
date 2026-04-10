<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth_admin.php';
requireAdmin();

header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_OFF);

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

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 100;
    $onlyUnread = isset($_GET['unread']) && $_GET['unread'] === '1';

    $countResult = $conn->query('SELECT COUNT(*) AS cnt FROM admin_notifications');
    $countRow = $countResult ? $countResult->fetch_assoc() : ['cnt' => 0];
    $existingCount = (int)($countRow['cnt'] ?? 0);

    if ($existingCount === 0) {
        $seedRows = [];

        $checkoutResult = $conn->query(
            'SELECT order_id, full_name, total_amount, created_at FROM checkout ORDER BY created_at DESC LIMIT 5'
        );
        if ($checkoutResult) {
            while ($row = $checkoutResult->fetch_assoc()) {
                $seedRows[] = [
                    'type' => 'order',
                    'title' => 'New Order Placed',
                    'message' => 'Order #' . $row['order_id'] . ' from ' . ($row['full_name'] ?: 'Customer') . ' amounting to P' . number_format((float)$row['total_amount'], 2),
                    'data_json' => json_encode(['orderId' => (string)$row['order_id']]),
                    'created_at' => $row['created_at']
                ];
            }
        }

        $stockResult = $conn->query(
            'SELECT product_id, name, stock, created_at FROM products WHERE stock > 0 AND stock < 15 ORDER BY stock ASC, created_at DESC LIMIT 3'
        );
        if ($stockResult) {
            while ($row = $stockResult->fetch_assoc()) {
                $seedRows[] = [
                    'type' => 'stock',
                    'title' => 'Low Stock Alert',
                    'message' => $row['name'] . ' (' . $row['product_id'] . ') is low on stock: ' . (int)$row['stock'] . ' remaining.',
                    'data_json' => json_encode(['productId' => (string)$row['product_id']]),
                    'created_at' => $row['created_at']
                ];
            }
        }

        if (empty($seedRows)) {
            $seedRows[] = [
                'type' => 'status',
                'title' => 'System Ready',
                'message' => 'Notification system is now connected to the database.',
                'data_json' => json_encode([]),
                'created_at' => date('Y-m-d H:i:s')
            ];
        }

        $insertStmt = $conn->prepare('INSERT INTO admin_notifications (type, title, message, data_json, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)');
        if ($insertStmt) {
            foreach ($seedRows as $seed) {
                $insertStmt->bind_param('sssss', $seed['type'], $seed['title'], $seed['message'], $seed['data_json'], $seed['created_at']);
                $insertStmt->execute();
            }
            $insertStmt->close();
        }
    }

    $sql = 'SELECT id, type, title, message, data_json, is_read, created_at FROM admin_notifications';
    if ($onlyUnread) {
        $sql .= ' WHERE is_read = 0';
    }
    $sql .= ' ORDER BY created_at DESC, id DESC LIMIT ' . $limit;

    $result = $conn->query($sql);
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $decoded = [];
            if (!empty($row['data_json'])) {
                $tmp = json_decode($row['data_json'], true);
                if (is_array($tmp)) {
                    $decoded = $tmp;
                }
            }
            $items[] = [
                'id' => (int)$row['id'],
                'type' => (string)$row['type'],
                'title' => (string)$row['title'],
                'message' => (string)$row['message'],
                'data' => $decoded,
                'read' => (bool)$row['is_read'],
                'timestamp' => (string)$row['created_at'],
            ];
        }
    }

    echo json_encode(['notifications' => $items]);
    exit;
}

$rawBody = file_get_contents('php://input');
$jsonBody = json_decode($rawBody, true);
$action = $_POST['action'] ?? ($jsonBody['action'] ?? '');

if ($method === 'POST') {
    if ($action === 'create') {
        $type = trim((string)($_POST['type'] ?? ($jsonBody['type'] ?? 'status')));
        $title = trim((string)($_POST['title'] ?? ($jsonBody['title'] ?? 'Notification')));
        $message = trim((string)($_POST['message'] ?? ($jsonBody['message'] ?? '')));
        $data = $_POST['data'] ?? ($jsonBody['data'] ?? []);

        if ($message === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Message is required']);
            exit;
        }

        if (!is_array($data)) {
            $data = [];
        }

        $dataJson = json_encode($data);
        $stmt = $conn->prepare('INSERT INTO admin_notifications (type, title, message, data_json, is_read) VALUES (?, ?, ?, ?, 0)');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Prepare failed']);
            exit;
        }
        $stmt->bind_param('ssss', $type, $title, $message, $dataJson);
        $ok = $stmt->execute();
        $newId = $ok ? (int)$stmt->insert_id : 0;
        $stmt->close();

        if (!$ok) {
            http_response_code(500);
            echo json_encode(['error' => 'Insert failed']);
            exit;
        }

        echo json_encode(['success' => true, 'id' => $newId]);
        exit;
    }

    if ($action === 'mark_read') {
        $id = (int)($_POST['id'] ?? ($jsonBody['id'] ?? 0));
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid id']);
            exit;
        }

        $stmt = $conn->prepare('UPDATE admin_notifications SET is_read = 1 WHERE id = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Prepare failed']);
            exit;
        }
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'mark_all_read') {
        $conn->query('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0');
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>