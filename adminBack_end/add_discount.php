<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth_admin.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    mysqli_report(MYSQLI_REPORT_OFF);

    // ✅ FIX 3: all keys now match what FormData actually sends
    $discountCode    = trim($_POST['discountCode']        ?? '');
    $typeInput       = trim($_POST['discountType']        ?? '');
    $desc            = trim($_POST['discountDescription'] ?? '');
    $discountValue   = (float)($_POST['discountValue']    ?? 0);
    $minPurchase     = (float)($_POST['discountMinPurchase'] ?? 0);

    // ✅ FIX 4: maxAmount may arrive as empty string when JS sends null
    $rawMax          = $_POST['discountMaxAmount'] ?? '';
    $maxDiscount     = ($rawMax !== '') ? (float)$rawMax : null;

    $startDate       = $_POST['discountStartDate']  ?? '';
    $endDate         = $_POST['discountEndDate']    ?? '';

    // ✅ FIX 5: these two were never assigned before
    $totalUsageLimit = (int)($_POST['discountUsageLimit']   ?? 0);
    $usagePerUser    = (int)($_POST['discountPerUserLimit'] ?? 1);
    $categoryInput   = trim($_POST['discountApplicableTo'] ?? '');

    $normalizedType = strtolower($typeInput);
    if ($normalizedType === 'percentage') {
        $discountType = 'Percentage';
    } elseif ($normalizedType === 'fixed' || $normalizedType === 'fixed amount') {
        $discountType = 'Fixed Amount';
    } else {
        $discountType = 'Percentage';
    }

    $normalizedCategory = strtolower($categoryInput);
    if ($normalizedCategory === 'men' || $normalizedCategory === 'male') {
        $discountCategory = 'Men';
    } elseif ($normalizedCategory === 'women' || $normalizedCategory === 'female') {
        $discountCategory = 'Women';
    } elseif ($normalizedCategory === 'unisex' || $normalizedCategory === 'all') {
        $discountCategory = 'Unisex';
    } else {
        $discountCategory = 'Unisex';
    }

    $startDateTime = $startDate ? ($startDate . ' 00:00:00') : null;
    $endDateTime   = $endDate ? ($endDate . ' 23:59:59') : null;

    if (!$discountCode || !$startDate || !$endDate) {
        echo 'error: missing required fields';
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO discount
            (discountCode, carts, description, discountValue,
             minPurchase, maxDiscount, discountCategory,
             startDate, endDate, totalUsageLimit, UsagePerUser)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        echo 'error: prepare failed - ' . $conn->error;
        exit;
    }

    $stmt->bind_param(
        "sssdddsssii",
        $discountCode,
        $discountType,
        $desc,
        $discountValue,
        $minPurchase,
        $maxDiscount,
        $discountCategory,
        $startDateTime,
        $endDateTime,
        $totalUsageLimit,
        $usagePerUser
    );

    if ($stmt->execute()) {
        echo 'success';
    } else {
        echo 'error: ' . $stmt->error;
    }

    $stmt->close();
}
?>