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
$adminId = (int)($_SESSION['user_id'] ?? 0);

function has_column(mysqli $conn, string $table, string $column): bool {
    $tableEsc = $conn->real_escape_string($table);
    $columnEsc = $conn->real_escape_string($column);
    $res = $conn->query("SHOW COLUMNS FROM `{$tableEsc}` LIKE '{$columnEsc}'");
    return $res && $res->num_rows > 0;
}

$hasIsRead = has_column($conn, 'messages', 'is_read');
$hasArchived = has_column($conn, 'messages', 'archived');
$hasStarred = has_column($conn, 'messages', 'starred');
$hasSenderType = has_column($conn, 'messages', 'sender_type');

$userPk = has_column($conn, 'users', 'user_id') ? 'user_id' : 'id';
$hasFirstName = has_column($conn, 'users', 'first_name');
$hasLastName = has_column($conn, 'users', 'last_name');
$hasName = has_column($conn, 'users', 'name');
$hasNumber = has_column($conn, 'users', 'number');

if ($method === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    // Send message
    if ($action === 'send') {
        $userId  = (int)($input['user_id'] ?? 0);
        $message = trim($input['message'] ?? '');
        if (!$userId || !$message) { echo json_encode(['error' => 'Invalid']); exit(); }

        if ($hasSenderType) {
            $sender = 'admin';
            $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message, sender_type, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param('iiss', $adminId, $userId, $message, $sender);
        } else {
            $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param('iis', $adminId, $userId, $message);
        }

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare message insert']);
            exit();
        }

        $stmt->execute();
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        exit();
    }

    // Mark as read
    if ($action === 'mark_read') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }

        if ($hasIsRead) {
            $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?");
            if ($stmt) {
                $stmt->bind_param('ii', $adminId, $userId);
                $stmt->execute();
                $stmt->close();
            }
        }

        echo json_encode(['success' => true]);
        exit();
    }

    // Archive conversation
    if ($action === 'archive') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }

        if ($hasArchived) {
            $stmt = $conn->prepare("UPDATE messages SET archived = 1 WHERE (sender_id = ? OR receiver_id = ?) AND (sender_id = ? OR receiver_id = ?)");
            if ($stmt) {
                $stmt->bind_param('iiii', $userId, $userId, $adminId, $adminId);
                $stmt->execute();
                $stmt->close();
            }
        }

        echo json_encode(['success' => true]);
        exit();
    }

    // Delete conversation
    if ($action === 'delete') {
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) { echo json_encode(['error' => 'Invalid']); exit(); }

        $stmt = $conn->prepare("DELETE FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND (sender_id = ? OR receiver_id = ?)");
        if ($stmt) {
            $stmt->bind_param('iiii', $userId, $userId, $adminId, $adminId);
            $stmt->execute();
            $stmt->close();
        }

        echo json_encode(['success' => true]);
        exit();
    }
}

// GET - fetch conversations grouped by user
$filter   = $_GET['filter'] ?? 'inbox';   // inbox | unread | starred | archive

$filterSql = '';
switch ($filter) {
    case 'unread':
        if ($hasIsRead) {
            $filterSql = "AND m.is_read = 0 AND m.receiver_id = $adminId";
        }
        break;
    case 'starred':
        if ($hasStarred) {
            $filterSql = "AND m.starred = 1";
        }
        break;
    case 'archive':
        if ($hasArchived) {
            $filterSql = "AND m.archived = 1";
        }
        break;
    default:
        if ($hasArchived) {
            $filterSql = "AND m.archived = 0";
        }
        break;
}

$nameExpr = $hasName
    ? 'u.name'
    : ($hasFirstName || $hasLastName
        ? "TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,'')))"
        : "CONCAT('User #', u.{$userPk})");

$phoneExpr = $hasNumber ? 'u.number' : "'N/A'";
$unreadExpr = $hasIsRead
    ? "(SELECT COUNT(*) FROM messages WHERE sender_id = u.{$userPk} AND receiver_id = $adminId AND is_read = 0 $filterSql)"
    : '0';

// Get distinct users who have messages with admin
$res = $conn->query("
    SELECT DISTINCT
        u.{$userPk} AS uid,
        {$nameExpr} AS name,
        u.email,
        {$phoneExpr} AS number,
        (SELECT message FROM messages
            WHERE (sender_id = u.{$userPk} OR receiver_id = u.{$userPk})
              AND (sender_id = $adminId OR receiver_id = $adminId)
              $filterSql
            ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages
            WHERE (sender_id = u.{$userPk} OR receiver_id = u.{$userPk})
              AND (sender_id = $adminId OR receiver_id = $adminId)
              $filterSql
            ORDER BY created_at DESC LIMIT 1) AS last_time,
        {$unreadExpr} AS unread_count
    FROM users u
    JOIN messages m ON (m.sender_id = u.{$userPk} OR m.receiver_id = u.{$userPk})
    WHERE (m.sender_id = $adminId OR m.receiver_id = $adminId)
      AND u.{$userPk} != $adminId
      $filterSql
    HAVING last_message IS NOT NULL
    ORDER BY last_time DESC
");

$conversations = [];
while ($row = $res->fetch_assoc()) {
    // Fetch messages for this user
    $uid = (int)$row['uid'];
    $msgRes = $conn->query("
        SELECT m.id, m.message AS text,
               IF(m.sender_id = $adminId, 'outgoing', 'incoming') AS type,
               DATE_FORMAT(m.created_at, '%h:%i %p') AS time,
               " . ($hasIsRead ? 'm.is_read' : '0 AS is_read') . "
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

    $displayName = trim((string)($row['name'] ?? ''));
    if ($displayName === '') {
        $displayName = 'User #' . $uid;
    }

    $nameParts = explode(' ', $displayName);
    $avatar = count($nameParts) >= 2
        ? strtoupper($nameParts[0][0] . $nameParts[1][0])
        : strtoupper(substr($displayName, 0, 2));

    $conversations[] = [
        'id'          => $uid,
        'name'        => $displayName,
        'email'       => (string)($row['email'] ?? ''),
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
