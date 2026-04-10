<?php
session_start();
include '../config.php';

if (!isset($_SESSION['email']) || $_SESSION['role'] !== 'user') {
    die("Invalid role.");
}

$user_id = $_SESSION['email'];
$user_name = $_SESSION['name'];

$admin = $conn->query("SELECT email, name FROM users WHERE role='admin' LIMIT 1")->fetch_assoc();
$admin_id = $admin['email'];
$admin_name = $admin['name'];

$stmt = $conn->prepare("
    SELECT id FROM conversations 
    WHERE user_id = ? AND admin_id = ? 
    LIMIT 1
");
$stmt->bind_param("ss", $user_id, $admin_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    $conversation = $res->fetch_assoc();
    $conversation_id = $conversation['id'];
} else {
    $stmt = $conn->prepare("INSERT INTO conversations (user_id, admin_id) VALUES (?, ?)");
    $stmt->bind_param("ss", $user_id, $admin_id);
    $stmt->execute();
    $conversation_id = $stmt->insert_id;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['message'])) {
    $msg = $_POST['message'];
    $stmt = $conn->prepare("
        INSERT INTO messages (conversation_id, sender_id, receiver_id, message)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("isss", $conversation_id, $user_id, $admin_id, $msg);
    $stmt->execute();
}

$stmt = $conn->prepare("
    SELECT sender_id, message, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
");
$stmt->bind_param("i", $conversation_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Chat with <?= htmlspecialchars($admin_name) ?></title>
<style>
body { font-family: Arial; max-width:600px; margin:auto; padding:20px; }
.chat-box { max-height:400px; overflow-y:auto; border:1px solid #ccc; padding:10px; border-radius:5px; background:#f9f9f9; }
.message { margin:10px 0; padding:10px; border-radius:20px; max-width:70%; word-wrap:break-word; }
.sent { background:#DCF8C6; margin-left:auto; text-align:right; }
.received { background:#F1F0F0; margin-right:auto; text-align:left; }
.time { font-size:0.8em; color:#888; margin-top:3px; }
form { display:flex; margin-top:20px; }
input[type=text] { flex:1; padding:10px; border-radius:5px; border:1px solid #ccc; }
button { padding:10px; margin-left:10px; border:none; border-radius:5px; background:#007bff; color:#fff; }
</style>
</head>
<body>

<h2>Chat with <?= htmlspecialchars($admin_name) ?></h2>

<div class="chat-box">
<?php
while ($row = $result->fetch_assoc()) {
    $class = ($row['sender_id'] === $user_id) ? 'sent' : 'received';
    echo '<div class="message '.$class.'">';
    echo '<div>'.htmlspecialchars($row['message']).'</div>';
    echo '<div class="time">'.$row['created_at'].'</div>';
    echo '</div>';
}
?>
</div>

<form method="POST">
    <input type="text" name="message" placeholder="Type your message..." required>
    <button type="submit">Send</button>
</form>
<a href = "inbox.php">back to inbox</a>
</body>
</html>