<?php
require_once __DIR__ . '/../config.php';
session_start();

if (!isset($_SESSION['email']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

header('Content-Type: application/json');

function percent_change(float $current, float $previous): float {
    if ($previous <= 0.0) {
        if ($current <= 0.0) {
            return 0.0;
        }
        return 100.0;
    }

    return (($current - $previous) / $previous) * 100;
}

$data = [];
$year = date('Y');

// Monthly revenue from checkout table.
$monthlySales = array_fill(0, 12, 0.0);
$res = $conn->query(
    "SELECT MONTH(created_at) AS month, SUM(total_amount) AS revenue
     FROM checkout
     WHERE YEAR(created_at) = {$year}
     GROUP BY MONTH(created_at)"
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $idx = (int)$row['month'] - 1;
        if ($idx >= 0 && $idx < 12) {
            $monthlySales[$idx] = (float)$row['revenue'];
        }
    }
}
$data['monthly_sales'] = $monthlySales;

// Sales by product category.
$categorySales = [];
$rows = [];
$totalCatSales = 0.0;
$res = $conn->query(
    "SELECT p.category, SUM(oi.quantity * oi.price) AS sales
     FROM order_items oi
     JOIN products p ON oi.product_id = p.product_id
     GROUP BY p.category"
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $rows[] = $row;
        $totalCatSales += (float)$row['sales'];
    }
}
foreach ($rows as $row) {
    $category = strtolower((string)$row['category']);
    if ($category === 'male') {
        $categoryLabel = 'Men';
    } elseif ($category === 'female') {
        $categoryLabel = 'Women';
    } else {
        $categoryLabel = 'Unisex';
    }

    $sales = (float)$row['sales'];
    $categorySales[] = [
        'category' => $categoryLabel,
        'sales' => $sales,
        'percentage' => $totalCatSales > 0 ? round(($sales / $totalCatSales) * 100) : 0,
    ];
}
$data['category_sales'] = $categorySales;

// Recent activities: latest orders + latest users.
$activities = [];

$res = $conn->query(
    "SELECT c.order_id, c.full_name, c.created_at
     FROM checkout c
     ORDER BY c.created_at DESC
     LIMIT 5"
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $activities[] = [
            'type' => 'order',
            'icon' => 'fa-shopping-cart',
            'title' => 'New order received',
            'description' => 'Order #' . $row['order_id'] . ' from ' . ($row['full_name'] ?: 'Customer'),
            'time' => $row['created_at'],
        ];
    }
}

$res = $conn->query(
    "SELECT first_name, last_name, created_at
     FROM users
     WHERE role = 'user'
     ORDER BY created_at DESC
     LIMIT 5"
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $fullName = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
        $activities[] = [
            'type' => 'user',
            'icon' => 'fa-user-plus',
            'title' => 'New user registered',
            'description' => ($fullName !== '' ? $fullName : 'A new user') . ' joined the platform',
            'time' => $row['created_at'],
        ];
    }
}

usort($activities, static fn($a, $b) => strtotime((string)$b['time']) - strtotime((string)$a['time']));
$data['recent_activities'] = array_slice($activities, 0, 7);

// Recent orders.
$recentOrders = [];
$res = $conn->query(
    "SELECT c.order_id,
            c.full_name AS customer_name,
            GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names,
            c.total_amount
     FROM checkout c
     LEFT JOIN order_items oi ON c.order_id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.product_id
     GROUP BY c.order_id, c.full_name, c.total_amount, c.created_at
     ORDER BY c.created_at DESC
     LIMIT 5"
);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $recentOrders[] = [
            'id' => '#' . $row['order_id'],
            'customerName' => $row['customer_name'] ?: 'Customer',
            'product' => $row['product_names'] ?: 'Items unavailable',
            'status' => 'Completed',
            'total' => (float)$row['total_amount'],
        ];
    }
}
$data['recent_orders'] = $recentOrders;

// Summary stats.
$res = $conn->query('SELECT COUNT(*) AS cnt, COALESCE(SUM(total_amount), 0) AS revenue FROM checkout');
$row = $res ? $res->fetch_assoc() : ['cnt' => 0, 'revenue' => 0];
$data['total_orders'] = (int)$row['cnt'];
$data['total_revenue'] = (float)$row['revenue'];

$res = $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'user'");
$data['total_customers'] = $res ? (int)$res->fetch_assoc()['cnt'] : 0;

$res = $conn->query('SELECT COUNT(*) AS cnt FROM products');
$data['total_products'] = $res ? (int)$res->fetch_assoc()['cnt'] : 0;

$data['avg_order_value'] = $data['total_orders'] > 0
    ? round($data['total_revenue'] / $data['total_orders'], 2)
    : 0.0;

// Month-over-month trends for summary cards.
$currentMonth = (int)date('n');
$currentYear = (int)date('Y');
$previousMonth = $currentMonth === 1 ? 12 : ($currentMonth - 1);
$previousMonthYear = $currentMonth === 1 ? ($currentYear - 1) : $currentYear;

$currentOrders = 0;
$previousOrders = 0;
$currentRevenue = 0.0;
$previousRevenue = 0.0;
$ordersTrendRes = $conn->query(
    "SELECT
        SUM(CASE WHEN YEAR(created_at) = {$currentYear} AND MONTH(created_at) = {$currentMonth} THEN 1 ELSE 0 END) AS current_orders,
        SUM(CASE WHEN YEAR(created_at) = {$previousMonthYear} AND MONTH(created_at) = {$previousMonth} THEN 1 ELSE 0 END) AS previous_orders,
        COALESCE(SUM(CASE WHEN YEAR(created_at) = {$currentYear} AND MONTH(created_at) = {$currentMonth} THEN total_amount ELSE 0 END), 0) AS current_revenue,
        COALESCE(SUM(CASE WHEN YEAR(created_at) = {$previousMonthYear} AND MONTH(created_at) = {$previousMonth} THEN total_amount ELSE 0 END), 0) AS previous_revenue
     FROM checkout"
);
if ($ordersTrendRes) {
    $trendRow = $ordersTrendRes->fetch_assoc();
    $currentOrders = (int)($trendRow['current_orders'] ?? 0);
    $previousOrders = (int)($trendRow['previous_orders'] ?? 0);
    $currentRevenue = (float)($trendRow['current_revenue'] ?? 0);
    $previousRevenue = (float)($trendRow['previous_revenue'] ?? 0);
}

$currentUsers = 0;
$previousUsers = 0;
$usersTrendRes = $conn->query(
    "SELECT
        SUM(CASE WHEN role = 'user' AND YEAR(created_at) = {$currentYear} AND MONTH(created_at) = {$currentMonth} THEN 1 ELSE 0 END) AS current_users,
        SUM(CASE WHEN role = 'user' AND YEAR(created_at) = {$previousMonthYear} AND MONTH(created_at) = {$previousMonth} THEN 1 ELSE 0 END) AS previous_users
     FROM users"
);
if ($usersTrendRes) {
    $trendRow = $usersTrendRes->fetch_assoc();
    $currentUsers = (int)($trendRow['current_users'] ?? 0);
    $previousUsers = (int)($trendRow['previous_users'] ?? 0);
}

$currentProducts = 0;
$previousProducts = 0;
$productsTrendRes = $conn->query(
    "SELECT
        SUM(CASE WHEN YEAR(created_at) = {$currentYear} AND MONTH(created_at) = {$currentMonth} THEN 1 ELSE 0 END) AS current_products,
        SUM(CASE WHEN YEAR(created_at) = {$previousMonthYear} AND MONTH(created_at) = {$previousMonth} THEN 1 ELSE 0 END) AS previous_products
     FROM products"
);
if ($productsTrendRes) {
    $trendRow = $productsTrendRes->fetch_assoc();
    $currentProducts = (int)($trendRow['current_products'] ?? 0);
    $previousProducts = (int)($trendRow['previous_products'] ?? 0);
}

$data['trends'] = [
    'products' => round(percent_change((float)$currentProducts, (float)$previousProducts), 1),
    'orders' => round(percent_change((float)$currentOrders, (float)$previousOrders), 1),
    'users' => round(percent_change((float)$currentUsers, (float)$previousUsers), 1),
    'revenue' => round(percent_change($currentRevenue, $previousRevenue), 1),
];

echo json_encode($data);
?>
