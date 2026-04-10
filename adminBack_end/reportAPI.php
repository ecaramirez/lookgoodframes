<?php
require_once '../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

$data = [];

// --- Monthly performance ---
$year = date('Y');
$monthlyPerformance = [];
$monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

$res = $conn->query("
    SELECT MONTH(o.created_at) AS month,
            SUM(o.total_amount) AS revenue,
            SUM(oi.quantity)    AS units
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE YEAR(o.created_at) = $year
    GROUP BY MONTH(o.created_at)
    ORDER BY MONTH(o.created_at)
");
$byMonth = [];
while ($row = $res->fetch_assoc()) {
    $byMonth[(int)$row['month']] = $row;
}
for ($m = 1; $m <= 12; $m++) {
    $monthlyPerformance[] = [
        'month'   => $monthNames[$m - 1],
        'revenue' => isset($byMonth[$m]) ? (float)$byMonth[$m]['revenue'] : 0,
        'units'   => isset($byMonth[$m]) ? (int)$byMonth[$m]['units']   : 0,
    ];
}
$data['monthly_performance'] = $monthlyPerformance;

// --- Summary metrics ---
$res = $conn->query("SELECT COUNT(*) AS cnt, SUM(total_amount) AS revenue FROM orders");
$row = $res->fetch_assoc();
$data['total_orders']  = (int)$row['cnt'];
$data['total_revenue'] = (float)$row['revenue'];

$res = $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'customer'");
$data['total_customers'] = (int)$res->fetch_assoc()['cnt'];

$data['avg_order_value'] = $data['total_orders'] > 0
    ? round($data['total_revenue'] / $data['total_orders'], 2)
    : 0;

// --- Top 5 products ---
$topProducts = [];
$res = $conn->query("
    SELECT p.name, SUM(oi.quantity) AS units_sold,
           SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 5
");
$rank = 1;
while ($row = $res->fetch_assoc()) {
    $topProducts[] = [
        'rank'       => $rank++,
        'name'       => $row['name'],
        'units_sold' => (int)$row['units_sold'],
        'revenue'    => (float)$row['revenue'],
    ];
}
$data['top_products'] = $topProducts;

// --- Financial overview ---
$gross    = $data['total_revenue'];
$discount = 0;
// if you have a discounts column: SELECT SUM(discount_amount) FROM orders
$data['financial'] = [
    'gross_revenue'    => $gross,
    'total_discounts'  => $discount,
    'net_revenue'      => $gross - $discount,
    'estimated_profit' => round(($gross - $discount) * 0.40, 2), // 40% margin estimate
];

echo json_encode($data);
?>
