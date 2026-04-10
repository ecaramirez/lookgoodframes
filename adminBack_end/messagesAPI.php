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

if ($method === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    // Send message
    if ($action === 'send') {
        $userId  = (int)($input['user_id'] ?? 0);
        $message = trim($input['message'] ?? '');
        if (!$userId || !$message) { echo json_encode(['error' => 'Invalid']); exit(); }

        $sender = 'admin';
        $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message, sender_type, created_at) VALUES (?, ?, ?, ?, NOW())");
        $adminId = (int)$_SESSION['id'];
        $stmt->bind_param('iiss', $adminId, $userId, $message, $sender);
        $stmt->execute();
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        exit();
    }

    // Mark as read
    if ($action === 'mark_read') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }
        $conn->query("UPDATE messages SET is_read = 1 WHERE receiver_id = {$_SESSION['id']} AND sender_id = $userId");
        echo json_encode(['success' => true]);
        exit();
    }

    // Archive conversation
    if ($action === 'archive') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }
        $stmt = $conn->prepare("UPDATE messages SET archived = 1 WHERE (sender_id = ? OR receiver_id = ?) AND (sender_id = ? OR receiver_id = ?)");
        $adminId = (int)$_SESSION['id'];
        $stmt->bind_param('iiii', $userId, $userId, $adminId, $adminId);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit();
    }

    // Delete conversation
    if ($action === 'delete') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }
        $adminId = (int)$_SESSION['id'];
        $stmt = $conn->prepare("DELETE FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND (sender_id = ? OR receiver_id = ?)");
        $stmt->bind_param('iiii', $userId, $userId, $adminId, $adminId);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit();
    }
}

// GET - fetch conversations grouped by user
$filter   = $_GET['filter'] ?? 'inbox';   // inbox | unread | starred | archive
$adminId  = (int)$_SESSION['id'];

$filterSql = '';
switch ($filter) {
    case 'unread':  $filterSql = "AND m.is_read = 0 AND m.receiver_id = $adminId"; break;
    case 'starred': $filterSql = "AND m.starred = 1"; break;
    case 'archive': $filterSql = "AND m.archived = 1"; break;
    default:        $filterSql = "AND m.archived = 0"; break;
}

// Get distinct users who have messages with admin
$res = $conn->query("
    SELECT DISTINCT
        u.id, u.name, u.email, u.number,
        (SELECT message FROM messages
            WHERE (sender_id = u.id OR receiver_id = u.id)
              AND (sender_id = $adminId OR receiver_id = $adminId)
              $filterSql
            ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages
            WHERE (sender_id = u.id OR receiver_id = u.id)
              AND (sender_id = $adminId OR receiver_id = $adminId)
              $filterSql
            ORDER BY created_at DESC LIMIT 1) AS last_time,
        (SELECT COUNT(*) FROM messages
            WHERE sender_id = u.id AND receiver_id = $adminId
              AND is_read = 0 $filterSql) AS unread_count
    FROM users u
    JOIN messages m ON (m.sender_id = u.id OR m.receiver_id = u.id)
    WHERE (m.sender_id = $adminId OR m.receiver_id = $adminId)
      AND u.id != $adminId
      $filterSql
    HAVING last_message IS NOT NULL
    ORDER BY last_time DESC
");

$conversations = [];
while ($row = $res->fetch_assoc()) {
    // Fetch messages for this user
    $uid = (int)$row['id'];
    $msgRes = $conn->query("
        SELECT m.id, m.message AS text,
               IF(m.sender_id = $adminId, 'outgoing', 'incoming') AS type,
               DATE_FORMAT(m.created_at, '%h:%i %p') AS time,
               m.is_read
        FROM messages m
        WHERE (m.sender_id = $uid OR m.receiver_id = $uid)
          AND (m.sender_id = $adminId OR m.receiver_id = $adminId)
        ORDER BY m.created_at ASC
    ");
    $messages = [];
    while ($msg = $msgRes->fetch_assoc()) {
        $entry = ['type' => $msg['type'], 'text' => $msg['text'], 'time' => $msg['time']];
        if ($msg['type'] === 'outgoing' && $msg['is_read']) {
            $entry['seen'] = 'Read ' . $msg['time'];
        }
        $messages[] = $entry;
    }

    $nameParts = explode(' ', $row['name']);
    $avatar = count($nameParts) >= 2
        ? strtoupper($nameParts[0][0] . $nameParts[1][0])
        : strtoupper(substr($row['name'], 0, 2));

    $conversations[] = [
        'id'          => $uid,
        'name'        => $row['name'],
        'email'       => $row['email'],
        'phone'       => $row['number'] ?? 'N/A',
        'location'    => 'Philippines',
        'avatar'      => $avatar,
        'lastMessage' => $row['last_message'] ?? '',
        'time'        => $row['last_time'] ? date('h:i A', strtotime($row['last_time'])) : '',
        'unread'      => (int)$row['unread_count'] > 0,
        'starred'     => false,
        'blocked'     => false,
        'messages'    => $messages,
    ];
}

echo json_encode($conversations);
?>
