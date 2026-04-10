<?php
require_once __DIR__ . '/../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

function parse_date(string $value, DateTime $fallback): DateTime {
    $date = DateTime::createFromFormat('Y-m-d', $value);
    if ($date === false) {
        return clone $fallback;
    }
    return $date;
}

$today = new DateTime('today');
$defaultStart = new DateTime($today->format('Y-m-01'));

$startInput = trim((string)($_GET['start'] ?? ''));
$endInput = trim((string)($_GET['end'] ?? ''));

$startDate = parse_date($startInput, $defaultStart);
$endDate = parse_date($endInput, $today);

if ($startDate > $endDate) {
    [$startDate, $endDate] = [$endDate, $startDate];
}

$startDateTime = $startDate->format('Y-m-d 00:00:00');
$endDateTime = $endDate->format('Y-m-d 23:59:59');

$data = [];

// Monthly performance (within selected range).
$monthlyMap = [];
$monthCursor = new DateTime($startDate->format('Y-m-01'));
$monthEnd = new DateTime($endDate->format('Y-m-01'));
while ($monthCursor <= $monthEnd) {
    $key = $monthCursor->format('Y-m');
    $monthlyMap[$key] = [
        'month' => $monthCursor->format('M'),
        'revenue' => 0.0,
        'units' => 0,
    ];
    $monthCursor->modify('+1 month');
}

$revenueStmt = $conn->prepare(
    "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COALESCE(SUM(total_amount), 0) AS revenue
     FROM checkout
     WHERE created_at BETWEEN ? AND ?
     GROUP BY ym
     ORDER BY ym"
);
if ($revenueStmt) {
    $revenueStmt->bind_param('ss', $startDateTime, $endDateTime);
    $revenueStmt->execute();
    $revenueRes = $revenueStmt->get_result();
    if ($revenueRes) {
        while ($row = $revenueRes->fetch_assoc()) {
            $key = (string)$row['ym'];
            if (isset($monthlyMap[$key])) {
                $monthlyMap[$key]['revenue'] = (float)($row['revenue'] ?? 0);
            }
        }
    }
    $revenueStmt->close();
}

$unitsStmt = $conn->prepare(
    "SELECT DATE_FORMAT(c.created_at, '%Y-%m') AS ym, COALESCE(SUM(oi.quantity), 0) AS units
     FROM checkout c
     LEFT JOIN order_items oi ON c.order_id = oi.order_id
     WHERE c.created_at BETWEEN ? AND ?
     GROUP BY ym
     ORDER BY ym"
);
if ($unitsStmt) {
    $unitsStmt->bind_param('ss', $startDateTime, $endDateTime);
    $unitsStmt->execute();
    $unitsRes = $unitsStmt->get_result();
    if ($unitsRes) {
        while ($row = $unitsRes->fetch_assoc()) {
            $key = (string)$row['ym'];
            if (isset($monthlyMap[$key])) {
                $monthlyMap[$key]['units'] = (int)($row['units'] ?? 0);
            }
        }
    }
    $unitsStmt->close();
}

$data['monthly_performance'] = array_values($monthlyMap);

// Summary metrics.
$summaryStmt = $conn->prepare(
    "SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(DISTINCT CASE
            WHEN user_id IS NOT NULL THEN CONCAT('u:', user_id)
            ELSE CONCAT('g:', LOWER(TRIM(COALESCE(full_name, 'guest'))))
        END) AS total_customers
     FROM checkout
     WHERE created_at BETWEEN ? AND ?"
);

$totalOrders = 0;
$totalRevenue = 0.0;
$totalCustomers = 0;
if ($summaryStmt) {
    $summaryStmt->bind_param('ss', $startDateTime, $endDateTime);
    $summaryStmt->execute();
    $summaryRes = $summaryStmt->get_result();
    if ($summaryRes) {
        $row = $summaryRes->fetch_assoc();
        $totalOrders = (int)($row['total_orders'] ?? 0);
        $totalRevenue = (float)($row['total_revenue'] ?? 0);
        $totalCustomers = (int)($row['total_customers'] ?? 0);
    }
    $summaryStmt->close();
}

$avgOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0.0;

$data['summary'] = [
    'total_revenue' => $totalRevenue,
    'total_orders' => $totalOrders,
    'total_customers' => $totalCustomers,
    'avg_order_value' => $avgOrderValue,
];

// Top products by revenue.
$topProducts = [];
$productsStmt = $conn->prepare(
    "SELECT p.name, COALESCE(SUM(oi.quantity), 0) AS units_sold,
            COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
     FROM checkout c
     JOIN order_items oi ON c.order_id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.product_id
     WHERE c.created_at BETWEEN ? AND ?
     GROUP BY oi.product_id, p.name
     ORDER BY revenue DESC
     LIMIT 5"
);
if ($productsStmt) {
    $productsStmt->bind_param('ss', $startDateTime, $endDateTime);
    $productsStmt->execute();
    $productsRes = $productsStmt->get_result();
    if ($productsRes) {
        while ($row = $productsRes->fetch_assoc()) {
            $topProducts[] = [
                'name' => (string)($row['name'] ?: 'Unknown Product'),
                'units_sold' => (int)($row['units_sold'] ?? 0),
                'revenue' => (float)($row['revenue'] ?? 0),
            ];
        }
    }
    $productsStmt->close();
}
$data['top_products'] = $topProducts;

// Discount analytics from discount table.
$discountAnalytics = [];
$estimatedDiscountTotal = 0.0;
$discountRes = $conn->query(
    "SELECT discountCode, carts, discountValue, currentUsage, totalUsageLimit, status, endDate
     FROM discount
     ORDER BY currentUsage DESC, discountCode ASC
     LIMIT 5"
);
if ($discountRes) {
    while ($row = $discountRes->fetch_assoc()) {
        $timesUsed = (int)($row['currentUsage'] ?? 0);
        $type = strtolower((string)($row['carts'] ?? ''));
        $discountValue = (float)($row['discountValue'] ?? 0);

        // Exact total discount is not tracked per order in schema; fixed amount can be approximated.
        $estimatedTotal = str_contains($type, 'fixed') ? ($discountValue * $timesUsed) : 0.0;
        $estimatedDiscountTotal += $estimatedTotal;

        $statusValue = trim((string)($row['status'] ?? ''));
        if ($statusValue === '') {
            $end = isset($row['endDate']) ? strtotime((string)$row['endDate']) : false;
            $statusValue = ($end && $end < time()) ? 'Expired' : 'Active';
        }

        $discountAnalytics[] = [
            'code' => (string)($row['discountCode'] ?? ''),
            'times_used' => $timesUsed,
            'total_discount' => round($estimatedTotal, 2),
            'status' => ucfirst(strtolower($statusValue)),
        ];
    }
}
$data['discount_analytics'] = $discountAnalytics;

// Financial overview.
$grossRevenue = $totalRevenue;
$netRevenue = max(0.0, $grossRevenue - $estimatedDiscountTotal);
$data['financial'] = [
    'gross_revenue' => round($grossRevenue, 2),
    'total_discounts' => round($estimatedDiscountTotal, 2),
    'net_revenue' => round($netRevenue, 2),
    'estimated_profit' => round($netRevenue * 0.40, 2),
];

echo json_encode($data);
?>
