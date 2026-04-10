<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../index.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$order_id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

if ($order_id <= 0) die("Invalid order ID.");

$sql = "
SELECT 
    oi.id AS order_item_id,
    oi.product_id,
    oi.quantity,
    oi.price,
    p.name AS product_name,
    o.created_at AS order_date,
    o.full_name,
    o.phone,
    o.province,
    o.city,
    o.barangay,
    o.street
FROM checkOut o
INNER JOIN order_items oi ON oi.order_id = o.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.user_id = ? AND o.order_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $order_id);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

if ($result->num_rows === 0) die("Order not found.");

$first_row = $result->fetch_assoc();
$order_items = [$first_row];
while($row = $result->fetch_assoc()){
    $order_items[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Details</title>
<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    table { border-collapse: collapse; width: 100%; background: #fff; border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px; border: 1px solid #ccc; text-align: center; }
    th { background-color: #f2f2f2; }
    h1, h2 { margin-top: 0; }
</style>
</head>
<body>

<h1>Order Details</h1>

<h2>Order ID: <?= $order_id ?></h2>
<h3>Order Date: <?= $first_row['order_date'] ?></h3>

<table>
<tr>
    <th>Product Name</th>
    <th>Product ID</th>
    <th>Quantity</th>
    <th>Price</th>
    <th>Total</th>
</tr>
<?php 
$grand_total = 0;
foreach ($order_items as $item): 
    $total = $item['price'] * $item['quantity'];
    $grand_total += $total;
?>
<tr>
    <td><?= htmlspecialchars($item['product_name']) ?></td>
    <td><?= $item['product_id'] ?></td>
    <td><?= $item['quantity'] ?></td>
    <td>₱<?= number_format($item['price'], 2) ?></td>
    <td>₱<?= number_format($total, 2) ?></td>
</tr>
<?php endforeach; ?>
<tr>
    <td colspan="4"><strong>Grand Total</strong></td>
    <td><strong>₱<?= number_format($grand_total, 2) ?></strong></td>
</tr>
</table>

<h3>Shipping Information</h3>
<p>
<strong>Name:</strong> <?= htmlspecialchars($first_row['full_name']) ?><br>
<strong>Phone:</strong> <?= htmlspecialchars($first_row['phone']) ?><br>
<strong>Address:</strong> <?= htmlspecialchars($first_row['street'] . ', ' . $first_row['barangay'] . ', ' . $first_row['city'] . ', ' . $first_row['province']) ?>
</p>

<br>
<a href="orders.php">My Orders</a>
<a href="mainpage.php">Main Page</a>
</body>
</html>