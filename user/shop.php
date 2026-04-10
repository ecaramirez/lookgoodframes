<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();
if(!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])){
    $_SESSION['cart'] = [];
}

$order = $_GET['order'] ?? 'newest';
switch($order){
    case 'price_asc':
        $order_sql = "ORDER BY price ASC";
        break;
    case 'price_desc':
        $order_sql = "ORDER BY price DESC";
        break;
    case 'name_asc':
        $order_sql = "ORDER BY name ASC";
        break;
    case 'name_desc':
        $order_sql = "ORDER BY name DESC";
        break;
    default:
        $order_sql = "ORDER BY created_at DESC";
}

$gender = $_GET['gender'] ?? 'all';
$gender_sql = '';
if ($gender != 'all') {
    $gender_safe = $conn->real_escape_string($gender);
    $gender_sql = " AND category LIKE '%$gender_safe%'";
}

$result = $conn->query("SELECT * FROM products WHERE status='active' AND stock > 0 $gender_sql $order_sql");
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shop Page</title>
<link rel="stylesheet" href="../css/shop.css">
</head>
<body>

<header>
    <h1>SHOE-MAI</h1>
    <nav>
        <a href="shop.php">SHOP</a>
        <a href="login.html">ABOUT</a>
        <a href="login.html">CONTACT</a>
        <a href="mainpage.php">MAIN PAGE</a>
        <?php if (isset($_SESSION['name'])): ?>
            <a href="UserProfile.php"><?= htmlspecialchars($_SESSION['name']) ?></a>
        <?php else: ?>
            <a href="../index.php">LOGIN</a>
        <?php endif; ?>
    </nav>
</header>

<form method="GET" class="sort-form">
    <label>Sort by:</label>
    <select name="order" onchange="this.form.submit()">
        <option value="newest" <?= $order=='newest' ? 'selected' : '' ?>>Newest</option>
        <option value="price_asc" <?= $order=='price_asc' ? 'selected' : '' ?>>Price: Low → High</option>
        <option value="price_desc" <?= $order=='price_desc' ? 'selected' : '' ?>>Price: High → Low</option>
        <option value="name_asc" <?= $order=='name_asc' ? 'selected' : '' ?>>Name: A → Z</option>
        <option value="name_desc" <?= $order=='name_desc' ? 'selected' : '' ?>>Name: Z → A</option>
    </select>

    <label>Gender:</label>
    <select name="gender" onchange="this.form.submit()">
        <option value="all" <?= (!isset($_GET['gender']) || $_GET['gender']=='all') ? 'selected' : '' ?>>All</option>
        <option value="Male" <?= (isset($_GET['gender']) && $_GET['gender']=='Male') ? 'selected' : '' ?>>Male</option>
        <option value="Female" <?= (isset($_GET['gender']) && $_GET['gender']=='Female') ? 'selected' : '' ?>>Female</option>
        <option value="Unisex" <?= (isset($_GET['gender']) && $_GET['gender']=='Unisex') ? 'selected' : '' ?>>Unisex</option>
    </select>
</form>


<div class="products">
<?php while ($product = $result->fetch_assoc()): ?>
    <a class="product-link" href="productDetails.php?id=<?= $product['product_id'] ?>">
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

            <!--<form action="addToCart.php" method="POST">
                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                <input type="hidden" name="product_name" value="<?= htmlspecialchars($product['name']) ?>">
                <input type="hidden" name="product_price" value="<?= $product['price'] ?>">
                <label>Qty:</label>
                <input type="number" name="quantity" value="1" min="1" max="<?= $product['stock'] ?>">
                <button type="submit">Add to Cart</button>
            </form>-->
        </div>
    </a>
<?php endwhile; ?>
</div>


<script src="../Actions/cart.js"></script>
</body>
</html>
