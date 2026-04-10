<?php
session_start();
require_once '../config.php';
require_once '../auth_user.php';
requireUser();

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'user') {
    header("Location: ../index.php");
    exit();
}

$user_id    = (int) ($_SESSION['user_id'] ?? 0);
$product_id = $_POST['product_id'] ?? '';
$quantity   = isset($_POST['quantity']) ? (int) $_POST['quantity'] : 1;
$action     = $_POST['action_type'] ?? 'add_to_cart';

// Validate early
if (!$user_id) {
    header("Location: ../index.php");
    exit();
}

if ($product_id === '' || $quantity <= 0) {
    die("Invalid product or quantity.");
}
// Validate early
if ($product_id === '' || $quantity <= 0) {
    die("Invalid product or quantity.");
}

if ($action === 'buy_now') {
    // Only read shipping/payment fields when actually checking out
    $full_name      = $_POST['full_name']      ?? '';
    $phone          = $_POST['phone']          ?? '';
    $address       = $_POST['address']       ?? '';
    $zip            = $_POST['zip']            ?? '';
    $payment_method = $_POST['payment_method'] ?? '';

    $stmt = $conn->prepare("SELECT name, price, stock FROM products WHERE product_id=?");
    $stmt->bind_param("s", $product_id);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$product) {
    die("product_id received: " . htmlspecialchars($product_id) . " | POST data: " . print_r($_POST, true));
}
    if ($product['stock'] < $quantity) die("Not enough stock for {$product['name']}.");

    $price     = $product['price'];
    $total     = $price * $quantity;
    $new_stock = $product['stock'] - $quantity;

    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("
            INSERT INTO checkOut 
            (user_id, total_amount, full_name, phone, address, zip, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "idsssss",
            $user_id, $total, $full_name, $phone, $address, $zip, $payment_method
        );
        $stmt->execute();
        $order_id = $stmt->insert_id;
        $stmt->close();

        $stmt = $conn->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param("isid", $order_id, $product_id, $quantity, $price);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("UPDATE products SET stock=? WHERE product_id=?");
        $stmt->bind_param("is", $new_stock, $product_id);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("DELETE FROM carts WHERE user_id=? AND product_id=?");
        $stmt->bind_param("is", $user_id, $product_id);
        $stmt->execute();
        $stmt->close();

        $conn->commit();
        header("Location: doneCheckout.php");
        exit;
    } catch (Exception $e) {
        $conn->rollback();
        die("Checkout failed: " . $e->getMessage());
    }

} else {
    // add_to_cart — no shipping fields needed
    $stmt = $conn->prepare("SELECT quantity FROM carts WHERE user_id=? AND product_id=?");
    $stmt->bind_param("is", $user_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row    = $result->fetch_assoc();
        $newQty = $row['quantity'] + $quantity;

        $stmt = $conn->prepare("UPDATE carts SET quantity=? WHERE user_id=? AND product_id=?");
        $stmt->bind_param("iis", $newQty, $user_id, $product_id);
        $stmt->execute();
        $stmt->close();
    } else {
        $stmt = $conn->prepare("INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $user_id, $product_id, $quantity);
        $stmt->execute();
        $stmt->close();
    }

    header("Location: shop.php");
    exit;
}
?>