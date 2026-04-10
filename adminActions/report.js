const PESO = '₱';
const REPORT_API_URL = '../adminBack_end/reportAPI.php';

const reportState = {
    activeFilter: 'thisMonth',
    rangeStart: null,
    rangeEnd: null,
    periodLabel: '',
    monthlyPerformance: [],
    summary: null,
    financial: null,
    topProducts: [],
    discountAnalytics: [],
};

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function formatPeso(value, decimals = 0) {
    const num = Number(value) || 0;
    return `${PESO}${num.toLocaleString('en-PH', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}`;
}

function formatInteger(value) {
    return (Number(value) || 0).toLocaleString('en-PH');
}

function formatDateInputValue(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatDateLong(date) {
    return date.toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function getRangeLabel(start, end) {
    return `${formatDateLong(start)} - ${formatDateLong(end)}`;
}

function getQuickRange(filterKey) {
    // I map quick-filter buttons to concrete date ranges here.
    const today = startOfDay(new Date());

    if (filterKey === 'today') {
        return { start: today, end: today };
    }

    if (filterKey === 'thisWeek') {
        const day = today.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset);
        return { start: weekStart, end: today };
    }

    if (filterKey === 'thisMonth') {
        return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
    }

    return {
        start: new Date(today.getFullYear(), 0, 1),
        end: today,
    };
}

function buildMonthlyPerformance(orders, start, end) {
    // I pre-create month buckets first so empty months still appear in the chart.
    const monthMap = new Map();
    const series = [];

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cursor <= lastMonth) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, {
            month: cursor.toLocaleDateString('en-PH', { month: 'short' }),
            revenue: 0,
            units: 0,
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    orders.forEach((order) => {
        const key = `${order.date.getFullYear()}-${String(order.date.getMonth() + 1).padStart(2, '0')}`;
        const bucket = monthMap.get(key);
        if (!bucket) return;

        bucket.revenue += order.netRevenue;
        bucket.units += order.units;
    });

    monthMap.forEach((value) => series.push(value));
    return series;
}

async function computeReportData(start, end) {
    const startBound = startOfDay(start);
    const endBound = endOfDay(end);

    const params = new URLSearchParams({
        start: formatDateInputValue(startBound),
        end: formatDateInputValue(endBound),
        _: String(Date.now()),
    });

    const response = await fetch(`${REPORT_API_URL}?${params.toString()}`, { cache: 'no-store' });
    const payload = await response.json();

    if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Failed to load report data');
    }

    return {
        monthlyPerformance: Array.isArray(payload.monthly_performance) ? payload.monthly_performance : [],
        summary: {
            totalRevenue: Number(payload.summary?.total_revenue || 0),
            totalOrders: Number(payload.summary?.total_orders || 0),
            totalCustomers: Number(payload.summary?.total_customers || 0),
            avgOrderValue: Number(payload.summary?.avg_order_value || 0),
        },
        financial: {
            grossRevenue: Number(payload.financial?.gross_revenue || 0),
            totalDiscount: Number(payload.financial?.total_discounts || 0),
            netRevenue: Number(payload.financial?.net_revenue || 0),
            estProfit: Number(payload.financial?.estimated_profit || 0),
        },
        topProducts: (Array.isArray(payload.top_products) ? payload.top_products : []).map((item) => ({
            name: item.name || 'Unknown Product',
            units: Number(item.units_sold || 0),
            revenue: Number(item.revenue || 0),
        })),
        discountAnalytics: (Array.isArray(payload.discount_analytics) ? payload.discount_analytics : []).map((item) => ({
            code: item.code || '',
            timesUsed: Number(item.times_used || 0),
            totalDiscount: Number(item.total_discount || 0),
            status: item.status || 'Inactive',
        })),
    };
}

function renderMonthlyPerformanceChart(data) {
    const chartContainer = document.getElementById('monthlyPerformanceChart');
    if (!chartContainer) return;

    if (!data.length) {
        chartContainer.innerHTML = '<div style="color:#9ca3af; font-size:13px;">No data for selected period.</div>';
        return;
    }

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const maxUnits = Math.max(...data.map((d) => d.units), 1);
    const maxValue = Math.max(maxRevenue, maxUnits * 150);

    chartContainer.innerHTML = data.map((row) => {
        const revenueHeight = (row.revenue / maxValue) * 100;
        const unitsHeight = ((row.units * 150) / maxValue) * 100;

        return `
            <div class="category-group">
                <div class="bars-container">
                    <div class="grouped-bar revenue" style="height: ${revenueHeight}%">
                        <span class="grouped-bar-value">${formatPeso(row.revenue)}</span>
                    </div>
                    <div class="grouped-bar units" style="height: ${unitsHeight}%">
                        <span class="grouped-bar-value">${formatInteger(row.units)} units</span>
                    </div>
                </div>
                <span class="category-label">${row.month}</span>
            </div>`;
    }).join('');
}

function renderTopProducts(topProducts) {
    const tbody = document.getElementById('topProductsBody');
    if (!tbody) return;

    if (!topProducts.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#9ca3af;">No data for selected period.</td></tr>';
        return;
    }

    tbody.innerHTML = topProducts.map((item, index) => `
        <tr>
            <td style="color:#9ca3af; font-weight:600;">${index + 1}</td>
            <td>${item.name}</td>
            <td>${formatInteger(item.units)}</td>
            <td style="font-weight:600;">${formatPeso(item.revenue)}</td>
        </tr>
    `).join('');
}

function renderDiscountAnalytics(discountAnalytics) {
    const tbody = document.getElementById('discountAnalyticsBody');
    if (!tbody) return;

    tbody.innerHTML = discountAnalytics.map((item) => {
        const badgeClass = item.status === 'Active' ? 'badge-success' : 'badge-danger';
        return `
            <tr>
                <td><strong>${item.code}</strong></td>
                <td>${formatInteger(item.timesUsed)}</td>
                <td>${formatPeso(item.totalDiscount)}</td>
                <td><span class="badge ${badgeClass}"><i class="fas fa-circle" style="font-size:7px;"></i> ${item.status}</span></td>
            </tr>
        `;
    }).join('');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setActiveQuickFilter(filterKey) {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filterKey);
    });
}

function renderReport() {
    // Keep cards, chart, and tables synchronized from the same computed state.
    setText('totalRevenueValue', formatPeso(reportState.summary.totalRevenue));
    setText('totalOrdersValue', formatInteger(reportState.summary.totalOrders));
    setText('totalCustomersValue', formatInteger(reportState.summary.totalCustomers));
    setText('avgOrderValueValue', formatPeso(reportState.summary.avgOrderValue, 2));

    setText('grossRevenueValue', formatPeso(reportState.financial.grossRevenue));
    setText('totalDiscountValue', formatPeso(reportState.financial.totalDiscount));
    setText('netRevenueValue', formatPeso(reportState.financial.netRevenue));
    setText('estProfitValue', formatPeso(reportState.financial.estProfit));

    setText('reportPeriodText', `Comprehensive business insights · ${reportState.periodLabel}`);

    renderMonthlyPerformanceChart(reportState.monthlyPerformance);
    renderTopProducts(reportState.topProducts);
    renderDiscountAnalytics(reportState.discountAnalytics);
}

async function applyFilterRange(start, end, filterKey = null) {
    const safeStart = startOfDay(start);
    const safeEnd = startOfDay(end);

    if (safeStart > safeEnd) {
        alert('The From date cannot be later than the To date.');
        return;
    }

    reportState.activeFilter = filterKey || 'custom';
    reportState.rangeStart = safeStart;
    reportState.rangeEnd = safeEnd;
    reportState.periodLabel = getRangeLabel(safeStart, safeEnd);

    try {
        const computed = await computeReportData(safeStart, safeEnd);
        reportState.monthlyPerformance = computed.monthlyPerformance;
        reportState.summary = computed.summary;
        reportState.financial = computed.financial;
        reportState.topProducts = computed.topProducts;
        reportState.discountAnalytics = computed.discountAnalytics;

        setActiveQuickFilter(filterKey);
        renderReport();
    } catch (error) {
        console.error('Failed to load report range:', error);
        alert('Unable to load report data from the database right now.');
    }
}

async function generatePDF() {
    if (!window.pdfMake) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js');
    }
    if (!window.pdfMake?.vfs) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js');
    }

    const BRAND = '#111111';
    const ACCENT = '#6b7280';

    const monthlyRows = reportState.monthlyPerformance.map((row) => {
        const avg = row.units ? row.revenue / row.units : 0;
        return [
            row.month,
            formatPeso(row.revenue),
            formatInteger(row.units),
            formatPeso(avg, 2),
        ];
    });

    const monthlyTotals = reportState.monthlyPerformance.reduce((acc, row) => {
        acc.revenue += row.revenue;
        acc.units += row.units;
        return acc;
    }, { revenue: 0, units: 0 });

    monthlyRows.push([
        'TOTAL',
        formatPeso(monthlyTotals.revenue),
        formatInteger(monthlyTotals.units),
        formatPeso(monthlyTotals.units ? monthlyTotals.revenue / monthlyTotals.units : 0, 2),
    ]);

    // I reuse one table builder so every PDF section keeps the same visual style.
    const sectionBlock = (title, headers, rows, widths) => {
        const headerRow = headers.map((header) => ({ text: header, style: 'tableHeader' }));
        const bodyRows = rows.length
            ? rows.map((row) => row.map((cell) => ({ text: String(cell), style: 'tableCell' })))
            : [[{ text: 'No data for selected period.', colSpan: headers.length, style: 'tableCell' }, ...new Array(headers.length - 1).fill({})]];

        return [
            { text: title.toUpperCase(), style: 'sectionTitle', margin: [0, 0, 0, 6] },
            {
                table: {
                    headerRows: 1,
                    widths,
                    body: [headerRow, ...bodyRows],
                },
                layout: {
                    hLineWidth: () => 0.6,
                    vLineWidth: () => 0.6,
                    hLineColor: () => '#e5e7eb',
                    vLineColor: () => '#e5e7eb',
                    fillColor: (rowIndex) => {
                        if (rowIndex === 0) return BRAND;
                        return rowIndex % 2 === 0 ? '#f9fafb' : null;
                    },
                },
                margin: [0, 0, 0, 14],
            },
        ];
    };

    const generatedOn = new Date().toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    // Export exactly what is currently shown on screen for the active filter period.
    const content = [
        {
            table: {
                widths: ['*'],
                body: [[{
                    stack: [
                        { text: 'Look Good Frames', style: 'coverTitle' },
                        { text: 'Annual Business Report — 2026', style: 'coverSubtitle', margin: [0, 6, 0, 0] },
                        { text: `Generated: ${generatedOn}`, style: 'coverSubtitle', margin: [0, 4, 0, 0] },
                        { text: `Report Period: ${reportState.periodLabel}`, style: 'coverSubtitle', margin: [0, 4, 0, 0] },
                    ],
                    fillColor: BRAND,
                    margin: [12, 10, 12, 12],
                }]],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 14],
        },
        ...sectionBlock(
            '1. Summary Metrics',
            ['Metric', 'Value'],
            [
                ['Total Revenue', formatPeso(reportState.summary.totalRevenue)],
                ['Total Orders', formatInteger(reportState.summary.totalOrders)],
                ['Total Customers', formatInteger(reportState.summary.totalCustomers)],
                ['Avg Order Value', formatPeso(reportState.summary.avgOrderValue, 2)],
            ],
            ['65%', '35%']
        ),
        ...sectionBlock(
            '2. Financial Overview',
            ['Metric', `Amount (${PESO})`],
            [
                ['Gross Revenue', formatPeso(reportState.financial.grossRevenue)],
                ['Total Discounts', formatPeso(reportState.financial.totalDiscount)],
                ['Net Revenue', formatPeso(reportState.financial.netRevenue)],
                ['Estimated Profit', formatPeso(reportState.financial.estProfit)],
            ],
            ['65%', '35%']
        ),
        ...sectionBlock(
            '3. Monthly Performance',
            ['Month', 'Revenue', 'Units Sold', 'Avg per Unit'],
            monthlyRows,
            ['18%', '28%', '24%', '30%']
        ),
        ...sectionBlock(
            '4. Top 5 Performing Products',
            ['#', 'Product Name', 'Units Sold', 'Revenue'],
            reportState.topProducts.map((item, index) => [
                String(index + 1),
                item.name,
                formatInteger(item.units),
                formatPeso(item.revenue),
            ]),
            ['8%', '50%', '17%', '25%']
        ),
        ...sectionBlock(
            '5. Discount Analytics',
            ['Code', 'Times Used', 'Total Discount Given', 'Status'],
            reportState.discountAnalytics.map((item) => [
                item.code,
                formatInteger(item.timesUsed),
                formatPeso(item.totalDiscount),
                item.status,
            ]),
            ['30%', '18%', '32%', '20%']
        ),
    ];

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 26, 40, 34],
        defaultStyle: {
            font: 'Roboto',
            fontSize: 9,
            color: BRAND,
        },
        footer: (currentPage, pageCount) => ({
            text: `Look Good Frames · Confidential · Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            color: ACCENT,
            fontSize: 8,
            margin: [0, 0, 0, 8],
        }),
        styles: {
            coverTitle: {
                color: '#ffffff',
                fontSize: 24,
                bold: true,
            },
            coverSubtitle: {
                color: '#d1d5db',
                fontSize: 10,
            },
            sectionTitle: {
                bold: true,
                fontSize: 11,
                color: BRAND,
            },
            tableHeader: {
                color: '#ffffff',
                bold: true,
                fillColor: BRAND,
                margin: [0, 2, 0, 2],
            },
            tableCell: {
                color: BRAND,
                margin: [0, 1, 0, 1],
            },
        },
        content,
    };

    window.pdfMake.createPdf(docDefinition).download('lookgood_report_2026.pdf');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function initFilters() {
    // I initialize with This Month, then quick/custom filters overwrite the same state.
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
    const applyBtn = document.getElementById('applyCustomRangeBtn');

    const initialRange = getQuickRange('thisMonth');
    fromInput.value = formatDateInputValue(initialRange.start);
    toInput.value = formatDateInputValue(initialRange.end);

    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const filterKey = btn.dataset.filter;
            const range = getQuickRange(filterKey);

            fromInput.value = formatDateInputValue(range.start);
            toInput.value = formatDateInputValue(range.end);

            applyFilterRange(range.start, range.end, filterKey);
        });
    });

    applyBtn.addEventListener('click', () => {
        if (!fromInput.value || !toInput.value) {
            alert('Please select both From and To dates.');
            return;
        }

        const start = new Date(fromInput.value);
        const end = new Date(toInput.value);
        applyFilterRange(start, end);
    });

    applyFilterRange(initialRange.start, initialRange.end, 'thisMonth');
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    initNotifications();
    initFilters();

    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            exportBtn.classList.add('loading');
            exportBtn.disabled = true;

            try {
                await generatePDF();
            } catch (error) {
                console.error('Failed to generate PDF:', error);
                alert('Unable to export PDF right now. Please check your internet connection and try again.');
            } finally {
                exportBtn.classList.remove('loading');
                exportBtn.disabled = false;
            }
        });
    }
});
