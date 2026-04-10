<?php
require_once '../config.php';

$result = $conn->query("SELECT * FROM products");

$products = [];

while ($row = $result->fetch_assoc()) {

    // Main image
    $mainImage = !empty($row['image'])
        ? '../uploads/products/' . $row['image']
        : null;

    // Gallery images (stored as JSON array of filenames)
    $galleryImages = [];
    if (!empty($row['image_gallery'])) {
        $decoded = json_decode($row['image_gallery'], true);
        if (is_array($decoded)) {
            foreach ($decoded as $filename) {
                $galleryImages[] = '../uploads/products/' . $filename;
            }
        }
    }

    // Full images array: main first, then gallery
    $images = array_filter(array_merge(
        $mainImage ? [$mainImage] : [],
        $galleryImages
    ));

    if (empty($images)) {
        $images = ['/global/jin.jpg'];
    }

    $products[] = [
        "id"           => $row['product_id'],
        "name"         => $row['name'],
        "description"  => $row['description'],
        "category"     => $row['category'],
        "price"        => (float)$row['price'],
        "stock"        => (int)$row['stock'],
        "images"       => array_values($images),
        "image"        => array_values($images)[0],
        "frameWidth"   => (float)$row['frameWidth'],
        "templeLength" => (float)$row['templeLength'],
        "material"     => $row['material']
    ];
}

header('Content-Type: application/json');
echo json_encode($products);
?>
