// ==========================================
// DASHBOARD.JS  – pulls all data from DB
// ==========================================

const COLORS = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];

function getStatusBadgeClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'shipped':   return 'badge-success';
        case 'pending':   return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default:          return 'badge-info';
    }
}

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

// Line chart
function renderSalesChart(monthlySales) {
    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if (!ctx) return;
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59,130,246,0.3)');
    gradient.addColorStop(1, 'rgba(59,130,246,0.01)');
    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{
            label: 'Revenue (₱)',
            data: monthlySales,
            borderColor: '#3B82F6',
            backgroundColor: gradient,
            borderWidth: 3, pointRadius: 5,
            pointBackgroundColor: '#fff', pointBorderColor: '#3B82F6',
            pointBorderWidth: 3, pointHoverRadius: 8,
            fill: true, tension: 0.4,
        }]},
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1F2937', titleColor: '#fff', bodyColor: '#fff',
                    padding: 12, cornerRadius: 8, displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.label}  ₱${Number(ctx.parsed.y).toLocaleString()}`,
                        title: () => '',
                    },
                },
            },
            scales: {
                x: { grid: { color: '#F3F4F6' }, border: { display: false }, ticks: { color: '#9CA3AF' } },
                y: { grid: { color: '#F3F4F6' }, border: { display: false },
                     ticks: { color: '#9CA3AF', callback: v => '₱' + Number(v).toLocaleString() } },
            },
        },
    });
}

// Donut chart
function salesByCategory(categoryData) {
    const chartContainer  = document.getElementById('categorySalesChart');
    const legendContainer = document.getElementById('categorySalesLegend');
    if (!chartContainer || !legendContainer) return;
    const totalSales = categoryData.reduce((s, i) => s + i.sales, 0);
    let currentAngle = 0;
    const gradientStops = categoryData.map((item, idx) => {
        const color = COLORS[idx % COLORS.length];
        item.color = color;
        const angle = (item.percentage / 100) * 360;
        const start = currentAngle;
        currentAngle += angle;
        return `${color} ${start}deg ${currentAngle}deg`;
    }).join(', ');
    chartContainer.innerHTML = `
        <div class="donut-chart" style="background:conic-gradient(${gradientStops});">
            <div class="donut-center" style="width:120px;height:120px;background:white;border-radius:50%;">
                <div class="donut-total">₱${(totalSales/1000).toFixed(0)}k</div>
                <div class="donut-label">Total Sales</div>
            </div>
        </div>`;
    legendContainer.innerHTML = categoryData.map(item => `
        <div class="legend-row">
            <div class="legend-info">
                <span class="legend-dot" style="background:${item.color};"></span>
                <span class="legend-name">${item.category}</span>
            </div>
            <div class="legend-stats">
                <span class="legend-value">₱${(item.sales/1000).toFixed(1)}k</span>
                <span class="legend-percentage">${item.percentage}%</span>
            </div>
        </div>`).join('');
}

// Recent activity
function recentActivity(activities) {
    const list = document.getElementById('activityList');
    if (!list) return;
    list.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon ${a.type}"><i class="fas ${a.icon}"></i></div>
            <div class="activity-content">
                <div class="activity-title">${a.title}</div>
                <div class="activity-description">${a.description}</div>
            </div>
            <div class="activity-time">${timeAgo(a.time)}</div>
        </div>`).join('');
}

// Recent orders
function recentOrders(orders) {
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (!tableBody) return;
    tableBody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td><span class="badge ${getStatusBadgeClass(o.status)}">${o.status}</span></td>
            <td><strong>₱${Number(o.total).toLocaleString()}</strong></td>
        </tr>`).join('');
}

// Stats cards
function renderStats(data) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('totalOrders',    (data.total_orders ?? 0).toLocaleString());
    set('totalRevenue',   '₱' + (data.total_revenue ?? 0).toLocaleString());
    set('totalCustomers', (data.total_customers ?? 0).toLocaleString());
    set('avgOrderValue',  '₱' + (data.avg_order_value ?? 0).toLocaleString());
}

// Fetch & render
document.addEventListener('DOMContentLoaded', () => {
    fetch('../adminBack_end/dashboardAPI.php')
        .then(res => res.json())
        .then(data => {
            renderSalesChart(data.monthly_sales ?? []);
            salesByCategory(data.category_sales ?? []);
            recentActivity(data.recent_activities ?? []);
            recentOrders(data.recent_orders ?? []);
            renderStats(data);
        })
        .catch(err => console.error('Dashboard API error:', err));
});
