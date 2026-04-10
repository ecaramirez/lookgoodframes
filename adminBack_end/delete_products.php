<?php
require_once '../config.php';
require_once '../auth_admin.php';
requireAdmin();

$id = $_GET['id'] ?? '';
if (empty($id)) {
    echo json_encode(['error' => 'Missing product ID']);
    exit();
}

// Fetch image filenames before deleting
$stmt = $conn->prepare("SELECT image, image_gallery FROM products WHERE product_id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();
$row    = $result->fetch_assoc();

if ($row) {
    // Delete main image
    if (!empty($row['image'])) {
        $path = '../uploads/products/' . $row['image'];
        if (file_exists($path)) unlink($path);
    }
    // Delete gallery images
    if (!empty($row['image_gallery'])) {
        $gallery = json_decode($row['image_gallery'], true);
        if (is_array($gallery)) {
            foreach ($gallery as $filename) {
                $path = '../uploads/products/' . $filename;
                if (file_exists($path)) unlink($path);
            }
        }
    }
}

$stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();

header('Content-Type: application/json');
echo json_encode(['success' => true]);
exit();
?>
