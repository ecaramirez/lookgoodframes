<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();

$id = $_GET['id'] ?? '';

if (empty($id)) {
    die("Invalid product ID");
}

// ✅ SAFE QUERY
$stmt = $conn->prepare("SELECT * FROM products WHERE product_id = ? AND status='active'");
$stmt->bind_param("s", $id);
$stmt->execute();

$result = $stmt->get_result();
$product = $result->fetch_assoc();

if (!$product) {
    die("Product not found.");
}

// Cart init
if(!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])){
    $_SESSION['cart'] = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($product['name']) ?></title>
</head>
<body>

<h1><?= htmlspecialchars($product['name']) ?></h1>
<p><?= htmlspecialchars($product['description']) ?></p>
<p><strong>Price:</strong> ₱<?= number_format($product['price'], 2) ?></p>
<p><strong>Stock:</strong> <?= $product['stock'] ?></p>

<?php if($product['image'] && file_exists('../uploads/products/'.$product['image'])): ?>
    <img src="../uploads/products/<?= htmlspecialchars($product['image']) ?>" width="300">
<?php else: ?>
    <img src="../uploads/products/" width="300">
<?php endif; ?>
<form action="orderLogic.php" method="POST">
    <input type="hidden" name="product_id" value="<?= $product['product_id'] ?>">
    <label>Qty:</label>
    <input type="number" name="quantity" value="1" min="1" max="<?= $product['stock'] ?>" required>
    <input type="hidden" name="action_type" value="add_to_cart">
    <button type="submit">Add to Cart</button>
</form>
<form action="checkOutProcess.php" method="POST">
    <input type="hidden" name="product_id" value="<?= $product['product_id'] ?>">
    <input type="number" name="quantity" value="1" min="1" max="<?= $product['stock'] ?>" required>
    <input type="hidden" name="action_type" value = "buy_now">
    <button type="submit">Order Now</button>
</form>

</body>
</html>
