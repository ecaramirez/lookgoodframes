<?php
require_once __DIR__ . '/../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// POST - save admin reply
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id    = (int)($input['id'] ?? 0);
    $reply = trim($input['reply'] ?? '');

    if (!$id || !$reply) {
        echo json_encode(['error' => 'Invalid input']); exit();
    }

    $stmt = $conn->prepare("UPDATE feedback SET admin_reply = ? WHERE id = ?");
    $stmt->bind_param('si', $reply, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit();
}

// GET - list all feedback
$feedbacks = [];
$res = $conn->query(
    "SELECT
        f.id,
        TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS customer,
        p.name AS product,
        f.rating,
        f.comment,
        COALESCE(f.admin_reply, '') AS reply,
        f.created_at AS date
     FROM feedback f
     LEFT JOIN users u ON f.user_id = u.user_id
     LEFT JOIN products p ON f.product_id = p.product_id
     ORDER BY f.created_at DESC"
);

if (!$res) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load feedback']);
    exit();
}

while ($row = $res->fetch_assoc()) {
    $row['id']     = (int)$row['id'];
    $row['customer'] = trim((string)($row['customer'] ?? '')) !== '' ? trim((string)$row['customer']) : 'Customer';
    $row['product'] = (string)($row['product'] ?? 'Product');
    $row['rating'] = (int)$row['rating'];
    $row['reply']  = $row['reply'] ?? '';
    $row['date']   = date('Y-m-d', strtotime($row['date']));
    $feedbacks[]   = $row;
}
echo json_encode($feedbacks);
?>
