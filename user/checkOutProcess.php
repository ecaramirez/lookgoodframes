<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();
$user_id = $_SESSION['user_id'] ?? 0;
$shipping_fee = 50;
$total = 0;
$items = [];

if(isset($_POST['action_type']) && $_POST['action_type'] === 'buy_now' && isset($_POST['product_id'])) {

    $product_id = $_POST['product_id'];
    $quantity   = (int)($_POST['quantity'] ?? 1);
    $product_status = 'active';

    $stmt = $conn->prepare("SELECT product_id, name, price, stock FROM products WHERE product_id=?");
    $stmt->bind_param("s", $product_id);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if($product){
        $product['quantity'] = $quantity;
        $product['subtotal'] = $product['price'] * $quantity;
        $total = $product['subtotal'];
        $items[] = $product;
    }

}
else {
    $product_status = 'active';

    $stmt = $conn->prepare("
        SELECT c.product_id, c.quantity, p.name, p.price
        FROM carts c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("is", $user_id, $product_status);
    $stmt->execute();
    $result = $stmt->get_result();

    while($row = $result->fetch_assoc()){
        $row['subtotal'] = $row['price'] * $row['quantity'];
        $total += $row['subtotal'];
        $items[] = $row;
    }

    $stmt->close();
}

$grand_total = $total + $shipping_fee;
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Checkout</title>
<style>
body{font-family:Arial;background:#f5f5f5;padding:20px;}
.container{max-width:900px;margin:auto;display:flex;gap:20px;flex-wrap:wrap;}
.box{background:#fff;padding:20px;border-radius:10px;flex:1;}
.summary{max-width:350px;}
input{width:100%;padding:10px;margin-bottom:10px;border-radius:6px;border:1px solid #ccc;}
button{background:#ff0050;color:#fff;border:none;padding:12px;width:100%;border-radius:6px;font-size:16px;}
h2,h3{margin-top:0;}
</style>
</head>
<body>

<div class="container">

<div class="box">
<h2>Checkout</h2>

<form action="orderLogic.php" method="POST">

<input type="hidden" name="shipping_fee" value="<?= $shipping_fee ?>">
<input type="hidden" name="grand_total" value="<?= $grand_total ?>">

<?php if(isset($_POST['action_type']) && $_POST['action_type'] === 'buy_now'): ?>
    <input type="hidden" name="action_type" value="buy_now">
    <input type="hidden" name="product_id" value="<?= $_POST['product_id'] ?>">
    <input type="hidden" name="quantity" value="<?= (int)($_POST['quantity'] ?? 1) ?>">
<?php else: ?>
    <input type="hidden" name="action_type" value="checkout_cart">
<?php endif; ?>

<h3>Shipping Information</h3>
<input type="text" name="full_name" placeholder="Full Name" required>
<input type="tel" name="phone" placeholder="Phone Number" required maxlength = "11">
<input type="text" name="address" placeholder="Address" required>
<input type="text" name="zip" placeholder="ZIP Code" required>

<h3>Payment Method</h3>
<label><input type="radio" name="payment_method" value="COD" checked> Cash on Delivery</label><br>
<label><input type="radio" name="payment_method" value="GCash"> GCash</label><br>
<label><input type="radio" name="payment_method" value="Card"> Credit/Debit Card</label><br><br>

<button type="submit">Place Order</button>
</form>
</div>

<div class="box summary">
<h3>Order Summary</h3>

<?php if(!empty($items)): ?>
    <?php foreach($items as $item): ?>
        <p>
        <?= htmlspecialchars($item['name']) ?> (x<?= $item['quantity'] ?>)<br>
        ₱<?= number_format($item['subtotal'],2) ?>
        </p>
    <?php endforeach; ?>
    <p>Subtotal: ₱<?= number_format($total,2) ?></p>
    <p>Shipping: ₱<?= number_format($shipping_fee,2) ?></p>
    <h3>Total: ₱<?= number_format($grand_total,2) ?></h3>
<?php else: ?>
    <p>Your cart is empty.</p>
<?php endif; ?>

</div>
</div>
</body>
</html>
