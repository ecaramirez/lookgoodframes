<?php
require_once __DIR__ . '/../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

$result = $conn->query("SELECT * FROM discount ORDER BY discountCode DESC");
$discounts = [];

while ($row = $result->fetch_assoc()) {
    $discounts[] = [
        'id' => $row['discountCode'],
        'code' => $row['discountCode'],
        'carts' => $row['carts'],
        'type' => strtolower($row['carts']) === 'fixed amount' ? 'fixed' : 'percentage',
        'description' => $row['description'],
        'value' => (float)$row['discountValue'],
        'minPurchase' => (float)$row['minPurchase'],
        'maxAmount' => $row['maxDiscount'] !== null ? (float)$row['maxDiscount'] : null,
        'applicableTo' => $row['discountCategory'],
        'startDate' => $row['startDate'] ? date('Y-m-d', strtotime($row['startDate'])) : '',
        'endDate' => $row['endDate'] ? date('Y-m-d', strtotime($row['endDate'])) : '',
        'usageLimit' => (int)$row['totalUsageLimit'],
        'perUserLimit' => (int)$row['UsagePerUser'],
        'usageCount' => 0,
        'active' => true
    ];
}

echo json_encode($discounts);
?>