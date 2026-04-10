<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'user') {
    header("Location: ../index.php");
    exit();
}

$user_id = $_SESSION['user_id'];

$sql = "
SELECT 
    o.order_id AS order_id,
    o.created_at,
    o.total_amount,
    GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names
FROM checkout o
INNER JOIN order_items oi ON oi.order_id = o.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.user_id = ?
GROUP BY o.order_id
ORDER BY o.created_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Orders</title>
<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .order-box { background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
    a { text-decoration: none; color: #333; }
    a:hover { color: #ff0050; }
    h1 { margin-bottom: 20px; }
</style>
</head>
<body>

<h1>My Orders</h1>

<?php if ($result->num_rows > 0): ?>
    <?php while ($order = $result->fetch_assoc()): ?>
        <div class="order-box">
            <a href="orderDetails.php?order_id=<?= $order['order_id'] ?>">
                <p>
                    <strong>Product Name:</strong> <?= $order['product_names'] ?><br>
                    <strong>Order Date:</strong> <?= $order['created_at'] ?><br>
                    <strong>Total:</strong> ₱<?= number_format($order['total_amount'], 2) ?>
                </p>
            </a>
        </div>
    <?php endwhile; ?>
<?php else: ?>
    <p>No orders found.</p>
<?php endif; ?>

<br>
<a href="UserProfile.php">Back to Profile</a>

</body>
</html>
