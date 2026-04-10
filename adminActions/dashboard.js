//to render bar chart and calculate the height based sa order count
document.addEventListener('DOMContentLoaded', function() {
    
    const ctx = document.getElementById('salesChart').getContext('2d');
    const salesData = [4.2, 3.8, 5.1, 6.5, 5.8, 7.2, 6.9, 8.1, 7.5, 8.8, 9.2, 8.5];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

    // Chart configuration
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
            label: 'Sales',
            data: salesData,
            borderColor: '#3B82F6',
            backgroundColor: gradient,
            borderWidth: 3,
            pointRadius: 5,              
            pointBackgroundColor: '#FFFFFF', 
            pointBorderColor: '#3B82F6',
            pointBorderWidth: 3,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#3B82F6',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 3,
            fill: true,
            tension: 0.4
        }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                // Hide the legend
                legend: {
                    display: false
                },
                
                tooltip: {
                    enabled: true,
                    backgroundColor: '#1F2937', 
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const month = context.label;          
                            const value = context.parsed.y;       
                            return `${month} ₱${value.toFixed(1)}k`; 
                        },
                        title: function() {
                            return ''; 
                        }
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                // X-axis
                x: {
                    grid: {
                        display: true,
                        color: '#F3F4F6', 
                        lineWidth: 1
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        color: '#9CA3AF', 
                        font: {
                            size: 12
                        }
                    }
                },
                // Y-axis 
                y: {
                    min: 0,
                    max: 10,
                    ticks: {
                        stepSize: 2,
                        color: '#9CA3AF', 
                        font: {
                            size: 12
                        },
                       
                        callback: function(value) {
                            return value + 'k';
                        }
                    },
                    grid: {
                        display: true,
                        color: '#F3F4F6', 
                        lineWidth: 1
                    },
                    border: {
                        display: false
                    }
                }
            },
            
        }
    };

   
    const salesChart = new Chart(ctx, config);

});


const categorySalesData = [
    { category: 'Women', sales: 5000, percentage: 50, color: '#ff6384' },
    { category: 'Men', sales: 3000, percentage: 30, color: '#36a2eb' },
    { category: 'Unisex', sales: 2000, percentage: 20, color: '#ffce56' },
];

function salesByCategory() {
    const chartContainer = document.getElementById('categorySalesChart');
    const legendContainer = document.getElementById('categorySalesLegend');
    if (!chartContainer || !legendContainer) {
        return;
    }

    //calculate total sales
    const totalSales = categorySalesData.reduce((sum, item) => sum + item.sales, 0);

    let currentAngle = 0; //for donut chart
    const gradientStops = categorySalesData.map(item => {
        //to calculate percentage to degrees
        const angle = (item.percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        return `${item.color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    chartContainer.innerHTML = `
        <div class="donut-chart" style="background: conic-gradient(${gradientStops});">
            <div class="donut-center" style="width: 120px; height: 120px; background: white; border-radius: 50%;">
                <div class="donut-total">₱${(totalSales / 1000).toFixed(0)}k</div>
                <div class="donut-label">Total Sales</div>
            </div>
        </div>
    `;

    legendContainer.innerHTML = categorySalesData.map(item => `
        <div class="legend-row">
            <div class="legend-info">
                <span class="legend-dot" style="background: ${item.color};"></span>
                <span class="legend-name">${item.category}</span>
            </div>
            <div class="legend-stats">
                <span class="legend-value">₱${(item.sales / 1000).toFixed(1)}k</span>
                <span class="legend-percentage">${item.percentage}%</span>
            </div>
        </div>
    `).join('');
}

//Recent Activities
const recentActivities = [
    { type: 'order', icon: 'fa-shopping-cart', title: 'New order received', description: 'Order #1234 from Erica Ramirez', time: '2 minutes ago' },
    { type: 'user', icon: 'fa-user-plus', title: 'New order registered', description: 'Pollyne Anne joined the platform', time: '15 minutes ago' },
    { type: 'product', icon: 'fa-box', title: 'Product updated', description: 'Classic Aviator Frame - Stock updated', time: '1 hour ago' },
    { type: 'product', icon: 'fa-box', title: 'Product updated', description: 'Classic Aviator Frame - Stock updated', time: '1 hour ago' },
    { type: 'payment', icon: 'fa-credit-card', title: 'Payment received', description: '₱245.00 from Order #1246', time: '2 hours ago' },
    { type: 'order', icon: 'fa-shopping-cart', title: 'Order shipped', description: 'Order #1245 has been dispatched', time: '3 hours ago' },
    { type: 'user', icon: 'fa-user-plus', title: 'New user registered', description: 'Edrian Sedrik joined the platform', time: '5 hours ago' }
];

function recentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

//Recent Orders
const mockdata = {
    orders: [
        { id: "#1234", customerName: "Erica Ramirez", product: "Classic Aviator Frame", status: "Shipped", total: 245 },
        { id: "#1234", customerName: "Pollyne Anne Bartolome", product: "Classic Aviator Frame", status: "Shipped", total: 245 },
        { id: "#1234", customerName: "Aahron Bautista", product: "Classic Aviator Frame", status: "Shipped", total: 245 },
        { id: "#1234", customerName: "Edrian Sedrik Halili", product: "Classic Aviator Frame", status: "Shipped", total: 245 },
    ]
};

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'shipped': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'cancelled': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

function recentOrders() {
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = mockdata.orders.slice(0, 5).map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.product}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            <td><strong>₱${order.total}</strong></td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    salesByCategory();
    recentActivity();
    recentOrders();
});
