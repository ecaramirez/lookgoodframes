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

// --- Monthly sales (revenue per month for current year) ---
$year = date('Y');
$monthlySales = array_fill(0, 12, 0);
$res = $conn->query("
    SELECT MONTH(created_at) AS month, SUM(total_amount) AS revenue
    FROM orders
    WHERE YEAR(created_at) = $year
    GROUP BY MONTH(created_at)
");
while ($row = $res->fetch_assoc()) {
    $monthlySales[(int)$row['month'] - 1] = (float)$row['revenue'];
}
$data['monthly_sales'] = $monthlySales;

// --- Category sales ---
$categorySales = [];
$res = $conn->query("
    SELECT p.category, SUM(oi.quantity * oi.price) AS sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.category
");
$totalCatSales = 0;
$rows = [];
while ($row = $res->fetch_assoc()) {
    $rows[] = $row;
    $totalCatSales += (float)$row['sales'];
}
foreach ($rows as $row) {
    $categorySales[] = [
        'category'   => ucfirst($row['category']),
        'sales'      => (float)$row['sales'],
        'percentage' => $totalCatSales > 0 ? round(($row['sales'] / $totalCatSales) * 100) : 0,
    ];
}
$data['category_sales'] = $categorySales;

// --- Recent activities (last 7 orders + last 7 new users) ---
$activities = [];

$res = $conn->query("
    SELECT o.id, u.name, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 5
");
while ($row = $res->fetch_assoc()) {
    $activities[] = [
        'type'        => 'order',
        'icon'        => 'fa-shopping-cart',
        'title'       => 'New order received',
        'description' => "Order #{$row['id']} from {$row['name']}",
        'time'        => $row['created_at'],
    ];
}

$res = $conn->query("
    SELECT name, created_at FROM users
    WHERE role = 'customer'
    ORDER BY created_at DESC
    LIMIT 5
");
while ($row = $res->fetch_assoc()) {
    $activities[] = [
        'type'        => 'user',
        'icon'        => 'fa-user-plus',
        'title'       => 'New user registered',
        'description' => "{$row['name']} joined the platform",
        'time'        => $row['created_at'],
    ];
}

// Sort by time descending
usort($activities, fn($a, $b) => strtotime($b['time']) - strtotime($a['time']));
$data['recent_activities'] = array_slice($activities, 0, 7);

// --- Recent orders ---
$recentOrders = [];
$res = $conn->query("
    SELECT o.id AS order_id, u.name AS customer_name,
           GROUP_CONCAT(p.name SEPARATOR ', ') AS product,
           o.status, o.total_amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    GROUP BY o.id, u.name, o.status, o.total_amount
    ORDER BY o.created_at DESC
    LIMIT 5
");
while ($row = $res->fetch_assoc()) {
    $recentOrders[] = [
        'id'           => '#' . $row['order_id'],
        'customerName' => $row['customer_name'],
        'product'      => $row['product'],
        'status'       => $row['status'] ?? 'Pending',
        'total'        => (float)$row['total_amount'],
    ];
}
$data['recent_orders'] = $recentOrders;

// --- Summary stats ---
$res = $conn->query("SELECT COUNT(*) AS cnt, SUM(total_amount) AS revenue FROM orders");
$row = $res->fetch_assoc();
$data['total_orders']  = (int)$row['cnt'];
$data['total_revenue'] = (float)$row['revenue'];

$res = $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'customer'");
$data['total_customers'] = (int)$res->fetch_assoc()['cnt'];

$data['avg_order_value'] = $data['total_orders'] > 0
    ? round($data['total_revenue'] / $data['total_orders'], 2)
    : 0;

echo json_encode($data);
?>
