<?php

session_start();
require_once '../config.php';

$result = $conn->query("SELECT * FROM products WHERE category = 'female' AND status = 'active' ORDER BY id DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Female category</title>
    <link rel = "stylesheet" href="../css/shop.css">
</head>
<body>
    <h1>Female Category Products</h1>
    <div class="products">
        <?php while($product = $result->fetch_assoc()): ?>
        <div class="product-card">
            <h3><?= htmlspecialchars($product['name']) ?></h3>
            <p><?= htmlspecialchars($product['description']) ?></p>
            <p><strong>Price:</strong> ₱<?= number_format($product['price'], 2) ?></p>
            <p><strong>Stock:</strong> <?= $product['stock'] ?></p>
            <p><strong>Category:</strong> <?= htmlspecialchars($product['category']) ?></p>

            <?php if($product['image'] && file_exists('../uploads/products/'.$product['image'])): ?>
                <img src="../uploads/products/<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>">
            <?php else: ?>
                <img src="../uploads/products/default.png" alt="No Image">
            <?php endif; ?>

            <form action="addToCart.php" method="POST">
                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                <label>Qty:</label>
                <input type="number" name="quantity" value="1" min="1" max="<?= $product['stock'] ?>">
                <button type="submit">Add to Cart</button>
            </form>
        </div>
        <?php endwhile; ?>
    </div>
    <a href = "mainpage.php" class="back-link">← Back to Main Page</a>
</body>
</html>