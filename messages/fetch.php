<?php
include '../config.php';
session_start();

$me = $_SESSION['id'];
$them = $_GET['other_id'];

$sql = "
    SELECT m.message, m.created_at, u.username AS sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE 
        (m.sender_id = ? AND m.receiver_id = ?)
        OR
        (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiii", $me, $them, $them, $me);
$stmt->execute();
$result = $stmt->get_result();
?>