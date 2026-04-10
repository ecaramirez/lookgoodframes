<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth_admin.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Invalid request method';
    exit;
}

$discountId = trim($_POST['discountId'] ?? '');
if ($discountId === '') {
    echo 'error: missing discount id';
    exit;
}

$stmt = $conn->prepare('DELETE FROM discount WHERE discountCode = ?');
if (!$stmt) {
    echo 'error: prepare failed - ' . $conn->error;
    exit;
}

$stmt->bind_param('s', $discountId);

if ($stmt->execute()) {
    echo 'success';
} else {
    echo 'error: ' . $stmt->error;
}

$stmt->close();
?>