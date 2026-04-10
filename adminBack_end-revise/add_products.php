<?php

require_once '../config.php';
require_once '../../auth_admin.php';
requireAdmin();

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['name'];
    $desc = $_POST['description'];
    $price = (float) $_POST['price'];
    $stock = (int)$_POST['stock'];
    $category = $_POST['category'];

    $imageName = NULL;
    if(isset($_FILES['image']) && $_FILES['image']['name'] != ""){
        $imageName = time().'_'.basename($_FILES['image']['name']);
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/products/'.$imageName);
    }
    $stmt = $conn->prepare("INSERT INTO products (name,description, price,stock,category,image) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdiss", $name, $desc, $price,$stock,$category,$imageName);
    $stmt->execute();
    header("Location: manage_product.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h2>Add New Product</h2>
    <form method = "POST" enctype="multipart/form-data">
        Name<input type = "text" name = "name" required><br>
        Description<textarea name = "description"></textarea><br>
        Price<input type = "number" step ="0.01" name = "price" required><br>
        Stock<input type = "number" name = "stock" required><br>
        Category
        <select name = "category" required>
            <option value = "male">male</option>
            <option value = "female">female</option>
            <option value = "unisex">unisex</option>
        </select><br>
        Image<input type = "file" name = "image"><br>
        <button type = "submit">Add Product</button>
        <a href ="manage_product.php">Cancel</a>
</body>
</html>
