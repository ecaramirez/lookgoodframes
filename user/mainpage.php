<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();
$user_id = $_SESSION['user_id'] ?? null;

$cartItems = [];
$cartCount = 0;

if ($user_id) {
    $stmt = $conn->prepare("
        SELECT c.product_id, c.quantity, p.name, p.price
        FROM carts c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $cartItems[] = $row;
        $cartCount += $row['quantity'];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Landing Page</title>
    <link rel="stylesheet" href="../css/mainpage.css">
</head>
<body>

<header>
    <h1>SHOE-MAI</h1>
    <nav>
        <a href="shop.php">SHOP</a>
        <a href="#">ABOUT</a>
        <a href="#">CONTACT</a>
        <a href="inbox.php">INBOX</a>

        <button id="cartLink" class="nav-btn">
            CART (<?= $cartCount ?>)
        </button>

<?php if (isset($_SESSION['email'])): ?>
    <a href="UserProfile.php"><?= htmlspecialchars($_SESSION['name']) ?></a>
<?php else: ?>
    <a href="UserProfile.php">LOGIN</a>
<?php endif; ?>
    </nav>
</header>

<section class="intro">
    <h1>STEP INTO GREATNESS</h1>
    <a href="shop.php"><button class="shop-now-btn">SHOP NOW</button></a>
</section>


<div id="cartPanel" class="cart-panel">
    <div class="cart-header">
        <h2>Your Cart</h2>
        <button id="closeCart">✖</button>
    </div>

    <div class="cart-content">
        <?php if (!empty($cartItems)): ?>
            <?php $total = 0; ?>
            <?php foreach ($cartItems as $item): ?>
                <?php
                    $subtotal = $item['price'] * $item['quantity'];
                    $total += $subtotal;
                ?>
                <div class="cart-item">
                    <p><strong><?= htmlspecialchars($item['name']) ?></strong></p>
                    <p>₱<?= number_format($item['price'], 2) ?> × <?= (int)$item['quantity'] ?></p>
                    <p>Subtotal: ₱<?= number_format($subtotal, 2) ?></p>

                    <form action="removeItems.php" method="POST">
                        <input type="hidden" name="product_id" value="<?= (int)$item['product_id'] ?>">
                        <button type="submit">Remove</button>
                    </form>
                    <form action="checkOutProcess.php" method="POST">
                        <input type="hidden" name="product_id" value="<?= (int)$item['product_id'] ?>">
                        <input type="hidden" name="quantity" value="<?= (int)$item['quantity'] ?>">
                        <input type="hidden" name="action_type" value="buy_now">
                        <button type="submit">Purchase</button>
                    </form>

                </div>
                <hr>
            <?php endforeach; ?>

            <h3>Total: ₱<?= number_format($total, 2) ?></h3>
        <?php else: ?>
            <p>Your cart is empty</p>
        <?php endif; ?>
    </div>
</div>

<div id="overlay"></div>

<script src="../Actions/cart.js"></script>
</body>
</html>
