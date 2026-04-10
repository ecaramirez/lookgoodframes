let dashboardChart = null;

function formatCurrency(value) {
    const amount = Number(value || 0);
    return `P${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrencyCompact(value) {
    const amount = Number(value || 0);
    if (amount >= 1000000) return `P${(amount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (amount >= 1000) return `P${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `P${amount.toFixed(0)}`;
}

function computeYAxisMax(maxValue) {
    const value = Number(maxValue || 0);
    if (value <= 0) return 1000;

    const padded = value * 1.2;
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    const scaled = Math.ceil(padded / magnitude) * magnitude;
    return Math.max(1000, scaled);
}

function updateSummaryCards(data) {
    const totalProductsEl = document.getElementById('dashboardTotalProducts');
    const totalOrdersEl = document.getElementById('dashboardTotalOrders');
    const totalUsersEl = document.getElementById('dashboardTotalUsers');
    const totalRevenueEl = document.getElementById('dashboardTotalRevenue');

    if (totalProductsEl) totalProductsEl.textContent = Number(data.total_products || 0).toLocaleString();
    if (totalOrdersEl) totalOrdersEl.textContent = Number(data.total_orders || 0).toLocaleString();
    if (totalUsersEl) totalUsersEl.textContent = Number(data.total_customers || 0).toLocaleString();
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(data.total_revenue || 0);

    const trends = data.trends || {};
    updateTrendElement('dashboardTrendProducts', Number(trends.products || 0));
    updateTrendElement('dashboardTrendOrders', Number(trends.orders || 0));
    updateTrendElement('dashboardTrendUsers', Number(trends.users || 0));
    updateTrendElement('dashboardTrendRevenue', Number(trends.revenue || 0));
}

function updateTrendElement(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const numeric = Number.isFinite(value) ? value : 0;
    const absValue = Math.abs(numeric).toFixed(1).replace(/\.0$/, '');

    let iconClass = 'fa-minus';
    let color = '#6b7280';
    if (numeric > 0) {
        iconClass = 'fa-arrow-up';
        color = '#16a34a';
    } else if (numeric < 0) {
        iconClass = 'fa-arrow-down';
        color = '#dc2626';
    }

    el.style.color = color;
    el.innerHTML = `<i class="fas ${iconClass}"></i> ${absValue}%`;
}

function renderSalesChart(monthlySales) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = Array.isArray(monthlySales) ? monthlySales.map((v) => Number(v || 0)) : new Array(12).fill(0);

    const maxValue = Math.max(...values, 0);
    const yMax = computeYAxisMax(maxValue);

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    if (dashboardChart) {
        dashboardChart.destroy();
    }

    dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Sales',
                data: values,
                borderColor: '#3B82F6',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#3B82F6',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#1F2937',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    displayColors: false,
                    callbacks: {
                        label: (context) => `${context.label} ${formatCurrency(context.parsed.y)}`,
                        title: () => ''
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#F3F4F6' },
                    border: { display: false },
                    ticks: { color: '#9CA3AF' }
                },
                y: {
                    min: 0,
                    max: yMax,
                    ticks: {
                        color: '#9CA3AF',
                        callback: (value) => formatCurrencyCompact(value)
                    },
                    grid: { color: '#F3F4F6' },
                    border: { display: false }
                }
            }
        }
    });
}

function renderCategorySales(categorySales) {
    const chartContainer = document.getElementById('categorySalesChart');
    const legendContainer = document.getElementById('categorySalesLegend');
    if (!chartContainer || !legendContainer) return;

    const colors = ['#ff6384', '#36a2eb', '#ffce56', '#8b5cf6', '#10b981'];
    const rows = (Array.isArray(categorySales) ? categorySales : []).map((row, index) => ({
        category: row.category || 'Unknown',
        sales: Number(row.sales || 0),
        percentage: Number(row.percentage || 0),
        color: colors[index % colors.length]
    }));

    const totalSales = rows.reduce((sum, item) => sum + item.sales, 0);

    if (rows.length === 0 || totalSales <= 0) {
        chartContainer.innerHTML = '<div class="empty-state">No category sales data.</div>';
        legendContainer.innerHTML = '';
        return;
    }

    let currentAngle = 0;
    const gradientStops = rows.map((item) => {
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        return `${item.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    chartContainer.innerHTML = `
        <div class="donut-chart" style="background: conic-gradient(${gradientStops});">
            <div class="donut-center" style="width: 120px; height: 120px; background: white; border-radius: 50%;">
                <div class="donut-total">${formatCurrency(totalSales)}</div>
                <div class="donut-label">Total Sales</div>
            </div>
        </div>
    `;

    legendContainer.innerHTML = rows.map((item) => `
        <div class="legend-row">
            <div class="legend-info">
                <span class="legend-dot" style="background: ${item.color};"></span>
                <span class="legend-name">${item.category}</span>
            </div>
            <div class="legend-stats">
                <span class="legend-value">${formatCurrency(item.sales)}</span>
                <span class="legend-percentage">${item.percentage}%</span>
            </div>
        </div>
    `).join('');
}

function formatRelativeTime(value) {
    if (!value) return 'Just now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function renderRecentActivity(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    const rows = Array.isArray(activities) ? activities : [];
    if (rows.length === 0) {
        activityList.innerHTML = '<div class="empty-state">No recent activity.</div>';
        return;
    }

    activityList.innerHTML = rows.map((activity) => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type || 'status'}">
                <i class="fas ${activity.icon || 'fa-bell'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title || 'Activity'}</div>
                <div class="activity-description">${activity.description || ''}</div>
            </div>
            <div class="activity-time">${formatRelativeTime(activity.time)}</div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'completed' || value === 'shipped' || value === 'delivered') return 'badge-success';
    if (value === 'pending') return 'badge-warning';
    if (value === 'cancelled' || value === 'failed') return 'badge-danger';
    return 'badge-secondary';
}

function renderRecentOrders(orders) {
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (!tableBody) return;

    const rows = Array.isArray(orders) ? orders : [];
    if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:16px;">No recent orders found.</td></tr>';
        return;
    }

    tableBody.innerHTML = rows.map((order) => `
        <tr>
            <td><strong>${order.id || '-'}</strong></td>
            <td>${order.customerName || 'Customer'}</td>
            <td>${order.product || '-'}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status || 'Completed'}</span></td>
            <td><strong>${formatCurrency(order.total || 0)}</strong></td>
        </tr>
    `).join('');
}

function renderDashboard(data) {
    updateSummaryCards(data || {});
    renderSalesChart(data.monthly_sales || []);
    renderCategorySales(data.category_sales || []);
    renderRecentActivity(data.recent_activities || []);
    renderRecentOrders(data.recent_orders || []);
}

function loadDashboardData() {
    fetch(`../adminBack_end/dashboardAPI.php?_=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
            if (data && !data.error) {
                renderDashboard(data);
            }
        })
        .catch((error) => {
            console.error('Failed to load dashboard data:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadDashboardData);
