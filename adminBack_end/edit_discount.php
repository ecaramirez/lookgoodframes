<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth_admin.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Invalid request method';
    exit;
}

mysqli_report(MYSQLI_REPORT_OFF);

$discountId = trim($_POST['discountId'] ?? '');
$discountCode = trim($_POST['discountCode'] ?? '');
$discountDescription = trim($_POST['discountDescription'] ?? '');
$discountType = trim($_POST['discountType'] ?? '');
$discountValue = (float)($_POST['discountValue'] ?? 0);
$discountMinPurchase = (float)($_POST['discountMinPurchase'] ?? 0);
$rawMax = $_POST['discountMaxAmount'] ?? '';
$discountMaxAmount = ($rawMax !== '') ? (float)$rawMax : null;
$startDate = trim($_POST['discountStartDate'] ?? '');
$endDate = trim($_POST['discountEndDate'] ?? '');
$discountUsageLimit = (int)($_POST['discountUsageLimit'] ?? 0);
$discountPerUserLimit = (int)($_POST['discountPerUserLimit'] ?? 1);
$discountApplicableTo = trim($_POST['discountApplicableTo'] ?? '');
$discountActive = trim($_POST['discountActive'] ?? '1') === '1' ? 1 : 0;

if ($discountId === '' || $discountCode === '' || $startDate === '' || $endDate === '') {
    echo 'error: missing required fields';
    exit;
}

$typeValue = strtolower($discountType) === 'fixed' || strtolower($discountType) === 'fixed amount' ? 'Fixed Amount' : 'Percentage';
$categoryValue = strtolower($discountApplicableTo);
if ($categoryValue === 'men' || $categoryValue === 'male') {
    $discountApplicableTo = 'Men';
} elseif ($categoryValue === 'women' || $categoryValue === 'female') {
    $discountApplicableTo = 'Women';
} else {
    $discountApplicableTo = 'Unisex';
}

$startDateTime = $startDate . ' 00:00:00';
$endDateTime = $endDate . ' 23:59:59';

$stmt = $conn->prepare(
    "UPDATE discount SET
        discountCode = ?,
        carts = ?,
        description = ?,
        discountValue = ?,
        minPurchase = ?,
        maxDiscount = ?,
        discountCategory = ?,
        startDate = ?,
        endDate = ?,
        totalUsageLimit = ?,
        UsagePerUser = ?
     WHERE discountCode = ?"
);

if (!$stmt) {
    echo 'error: prepare failed - ' . $conn->error;
    exit;
}

$stmt->bind_param(
    'sssdddsssiis',
    $discountCode,
    $typeValue,
    $discountDescription,
    $discountValue,
    $discountMinPurchase,
    $discountMaxAmount,
    $discountApplicableTo,
    $startDateTime,
    $endDateTime,
    $discountUsageLimit,
    $discountPerUserLimit,
    $discountId
);

if ($stmt->execute()) {
    echo 'success';
} else {
    echo 'error: ' . $stmt->error;
}

$stmt->close();
?>