<?php
require_once '../config.php';
require_once 'auth.php';
requireAdmin();

$id = $_GET['id'];
$result = $conn->query("SELECT * FROM products where id = $id");
$product = $result->fetch_assoc();

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['name'];
    $desc = $_POST['description'];
    $price = (float)$_POST['price'];
    $stock = (int)$_POST['stock'];
    $category = $_POST['category'];

    if ($stock <= 0) {
        $status = 'inactive';
    } else {
        $status = $_POST['status'];
    }

    if(isset($_FILES['image']) &&$_FILES['image']['name'] != ""){
        $imageName = time().'_'. $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/products/'.$imageName);
    } else {
        $imageName = $product['image'];
    }
    
    $stmt = $conn->prepare("UPDATE products SET name = ?, description = ?, price = ?, stock = ?, status = ?, category = ?, image = ? WHERE id = ?");
    $stmt->bind_param("ssdisssi", $name, $desc, $price, $stock, $status, $category, $imageName, $id);
    $stmt->execute();

    header('Location: manage_product.php');
    exit();
}
?>