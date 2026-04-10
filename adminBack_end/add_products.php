<?php
require_once '../config.php';
require_once '../auth_admin.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Invalid request method';
    exit;
}

$prodID   = strtoupper(trim($_POST['addProductID'] ?? ''));
$name     = trim($_POST['addProductName'] ?? '');
$desc     = trim($_POST['addProductDescription'] ?? '');
$frame    = (float) ($_POST['addProductFrame'] ?? 0);
$temple   = (float) ($_POST['addProductTemple'] ?? 0);
$material = trim($_POST['addProductMaterial'] ?? '');
$price    = (float) ($_POST['addProductPrice'] ?? 0);
$stock    = (int)   ($_POST['addProductStock'] ?? 0);
$category = trim($_POST['addProductCategory'] ?? '');

if ($prodID === '' || $name === '' || $category === '' || $price <= 0) {
    http_response_code(400);
    echo 'Missing or invalid required fields';
    exit;
}

$imageNames = [];
for ($i = 1; $i <= 4; $i++) {
    $key = 'addProductImage' . $i;
    if (isset($_FILES[$key]) && $_FILES[$key]['error'] === UPLOAD_ERR_OK && $_FILES[$key]['name'] !== '') {
        $imageName = time() . '_' . $i . '_' . basename($_FILES[$key]['name']);
        if (move_uploaded_file($_FILES[$key]['tmp_name'], '../uploads/products/' . $imageName)) {
            $imageNames[] = $imageName;
        }
    }
}

$mainImage = $imageNames[0] ?? null;
$gallery   = count($imageNames) > 1 ? json_encode(array_slice($imageNames, 1)) : null;

$stmt = $conn->prepare(
    "INSERT INTO products (product_id, name, description, frameWidth, templeLength, material, price, stock, category, image, image_gallery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    http_response_code(500);
    echo 'Prepare failed: ' . $conn->error;
    exit;
}

// s=prodID, s=name, s=desc, d=frame, d=temple, s=material, d=price, i=stock, s=category, s=mainImage, s=gallery
$stmt->bind_param("sssddsdisss", $prodID, $name, $desc, $frame, $temple, $material, $price, $stock, $category, $mainImage, $gallery);

if ($stmt->execute()) {
    echo 'success';
} else {
    http_response_code(400);
    echo 'Insert failed: ' . $stmt->error;
}

$stmt->close();
?>

