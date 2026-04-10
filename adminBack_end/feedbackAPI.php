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
$res = $conn->query("
    SELECT f.id, u.name AS customer, p.name AS product,
           f.rating, f.comment, f.admin_reply AS reply, f.created_at AS date
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    JOIN products p ON f.product_id = p.id
    ORDER BY f.created_at DESC
");
while ($row = $res->fetch_assoc()) {
    $row['id']     = (int)$row['id'];
    $row['rating'] = (int)$row['rating'];
    $row['reply']  = $row['reply'] ?? '';
    $row['date']   = date('Y-m-d', strtotime($row['date']));
    $feedbacks[]   = $row;
}
echo json_encode($feedbacks);
?>
