<?php
$me_email = $_SESSION['email'];   
$role = $_SESSION['role'];        
define('STORE_NAME', 'SHOE-MAI Store');
function showUserInbox($conn, $user_email) {
    

    $admin = $conn->query("SELECT email FROM users WHERE role='admin' LIMIT 1")->fetch_assoc();
    $admin_email = $admin['email'];

    $sql = "
        SELECT message, created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT 5
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $user_email, $admin_email, $admin_email, $user_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo '<div class="conversation">';
            echo '<span class="name">' . STORE_NAME . '</span>';
            echo '<span class="time">' . $row['created_at'] . '</span>';
            echo '<div class="message">' . htmlspecialchars($row['message']) . '</div>';
            echo '<div><a href="chat.php?admin_email=' . urlencode($admin_email) . '">Open Chat</a></div>';
            echo '</div>';
        }
    } else {
        echo '<p>No messages yet. Start a conversation with ' . STORE_NAME . '.</p>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Inbox</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .conversation { border-bottom: 1px solid #ccc; padding: 10px 0; }
        .name { font-weight: bold; }
        .message { margin-left: 10px; color: #555; }
        .time { float: right; font-size: 0.85em; color: #888; }
    </style>
</head>
<body>

<h2>Inbox</h2>

<?php
if ($role === 'user') {

    showUserInbox($conn, $me_email);

}
else if ($role === 'admin') {
    $sql = "
        SELECT u.email AS user_email, u.name, m.message, MAX(m.created_at) AS last_message
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.receiver_id = ?
        GROUP BY u.email
        ORDER BY last_message DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $me_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo '<div class="conversation">';
            echo '<span class="name">' . htmlspecialchars($row['name']) . '</span>';
            echo '<span class="time">' . $row['last_message'] . '</span>';
            echo '<div class="message">' . htmlspecialchars($row['message']) . '</div>';
            echo '<div><a href="../admin/chat.php?user_email=' . urlencode($row['user_email']) . '">Open Chat</a></div>';
            echo '</div>';
        }
    } else {
        echo '<p>No messages yet from users.</p>';
    }

} else {
    echo '<p>Invalid role.</p>';
}

?>
</body>
</html>
