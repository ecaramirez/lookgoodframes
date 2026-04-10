// ==========================================
// REPORT.JS – pulls data from reportAPI.php
// ==========================================

let reportData = null;

// ── Bar chart ─────────────────────────────
function renderMonthlyPerformanceChart(monthlyData) {
    const chartContainer = document.getElementById('monthlyPerformanceChart');
    if (!chartContainer || !monthlyData || monthlyData.length === 0) return;

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
    const maxUnits   = Math.max(...monthlyData.map(d => d.units));
    const maxValue   = Math.max(maxRevenue, maxUnits * 150);

    chartContainer.innerHTML = monthlyData.map(data => {
        const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;
        const unitsHeight   = maxValue > 0 ? ((data.units * 150) / maxValue) * 100 : 0;
        return `
            <div class="category-group">
                <div class="bars-container">
                    <div class="grouped-bar revenue" style="height:${revenueHeight}%">
                        <span class="grouped-bar-value">₱${(data.revenue / 1000).toFixed(1)}k</span>
                    </div>
                    <div class="grouped-bar units" style="height:${unitsHeight}%">
                        <span class="grouped-bar-value">${data.units}</span>
                    </div>
                </div>
                <span class="category-label">${data.month}</span>
            </div>`;
    }).join('');
}

// ── Summary stats ─────────────────────────
function renderSummaryStats(data) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('reportTotalRevenue',   '₱' + Number(data.total_revenue ?? 0).toLocaleString());
    set('reportTotalOrders',    Number(data.total_orders ?? 0).toLocaleString());
    set('reportTotalCustomers', Number(data.total_customers ?? 0).toLocaleString());
    set('reportAvgOrderValue',  '₱' + Number(data.avg_order_value ?? 0).toLocaleString());
}

// ── Top products table ────────────────────
function renderTopProducts(products) {
    const tbody = document.querySelector('#topProductsTable tbody');
    if (!tbody || !products) return;
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.rank}</td>
            <td><strong>${p.name}</strong></td>
            <td>${Number(p.units_sold).toLocaleString()}</td>
            <td><strong>₱${Number(p.revenue).toLocaleString()}</strong></td>
        </tr>`).join('');
}

// ── Financial overview table ──────────────
function renderFinancial(fin) {
    const tbody = document.querySelector('#financialTable tbody');
    if (!tbody || !fin) return;
    tbody.innerHTML = `
        <tr><td>Gross Revenue</td>        <td style="text-align:right;font-weight:bold;">₱${Number(fin.gross_revenue).toLocaleString()}</td></tr>
        <tr><td>Total Discounts Given</td><td style="text-align:right;font-weight:bold;">₱${Number(fin.total_discounts).toLocaleString()}</td></tr>
        <tr><td>Net Revenue</td>          <td style="text-align:right;font-weight:bold;">₱${Number(fin.net_revenue).toLocaleString()}</td></tr>
        <tr><td>Estimated Profit</td>     <td style="text-align:right;font-weight:bold;">₱${Number(fin.estimated_profit).toLocaleString()}</td></tr>`;
}

// ── PDF export ────────────────────────────
async function generatePDF() {
    if (!reportData) { alert('Report data not loaded yet. Please wait.'); return; }

    if (!window.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!window.jspdf?.jsPDF?.API?.autoTable) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
    }

    const { jsPDF } = window.jspdf;
    const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PAGE_W   = 210, MARGIN = 14, COL_W = 210 - 14 * 2;
    const BRAND    = '#111111', ACCENT = '#6b7280', LIGHT_BG = '#f3f4f6';
    let y = 0;

    // Header
    doc.setFillColor(BRAND);
    doc.rect(0, 0, PAGE_W, 36, 'F');
    doc.setFont('helvetica', 'bold');   doc.setFontSize(20); doc.setTextColor('#ffffff');
    doc.text('Look Good Frames', MARGIN, 16);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor('#cccccc');
    doc.text(`Annual Business Report — ${new Date().getFullYear()}`, MARGIN, 24);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}`, MARGIN, 30);
    y = 44;

    function sectionTitle(title) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(BRAND);
        doc.text(title.toUpperCase(), MARGIN, y);
        doc.setDrawColor(BRAND); doc.setLineWidth(0.5);
        doc.line(MARGIN, y + 1.5, MARGIN + COL_W, y + 1.5);
        y += 8;
    }

    function summaryGrid(items) {
        const cardW = (COL_W - 4) / 2, cardH = 18, pad = 4;
        for (let i = 0; i < items.length; i += 2) {
            [items[i], items[i+1]].forEach((item, idx) => {
                if (!item) return;
                const x = idx === 0 ? MARGIN : MARGIN + cardW + 4;
                doc.setFillColor(LIGHT_BG); doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
                doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(item.color || BRAND);
                doc.text(item.value, x + pad, y + 10);
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(ACCENT);
                doc.text(item.label, x + pad, y + 16);
            });
            y += cardH + 4;
        }
        y += 4;
    }

    function drawTable(head, body, colStyles = {}) {
        doc.autoTable({
            startY: y, head: [head], body,
            margin: { left: MARGIN, right: MARGIN }, tableWidth: COL_W,
            styles: { font:'helvetica', fontSize:9, cellPadding:4, textColor:'#111111', lineColor:'#e5e7eb', lineWidth:0.3, overflow:'linebreak', valign:'middle' },
            headStyles: { fillColor:[17,17,17], textColor:[255,255,255], fontStyle:'bold', fontSize:9, halign:'center', valign:'middle' },
            bodyStyles: { fillColor:[255,255,255], valign:'middle' },
            alternateRowStyles: { fillColor:[249,250,251] },
            columnStyles: colStyles,
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    const fin = reportData.financial;
    const mp  = reportData.monthly_performance;

    // 1. Summary
    sectionTitle('1. Summary Metrics');
    summaryGrid([
        { label:'Total Revenue',   value:'₱' + Number(reportData.total_revenue).toLocaleString(),   color:'#10b981' },
        { label:'Total Orders',    value:Number(reportData.total_orders).toLocaleString(),            color:BRAND     },
        { label:'Total Customers', value:Number(reportData.total_customers).toLocaleString(),         color:'#9333ea' },
        { label:'Avg Order Value', value:'₱' + Number(reportData.avg_order_value).toLocaleString(),  color:'#0ea5e9' },
    ]);

    // 2. Financial
    sectionTitle('2. Financial Overview');
    drawTable(['Metric','Amount (₱)'], [
        ['Gross Revenue',         '₱' + Number(fin.gross_revenue).toLocaleString()],
        ['Total Discounts Given', '₱' + Number(fin.total_discounts).toLocaleString()],
        ['Net Revenue',           '₱' + Number(fin.net_revenue).toLocaleString()],
        ['Estimated Profit',      '₱' + Number(fin.estimated_profit).toLocaleString()],
    ], { 0:{ cellWidth:110 }, 1:{ halign:'right', fontStyle:'bold' } });

    // 3. Monthly
    sectionTitle('3. Monthly Performance');
    const totalRev   = mp.reduce((s, d) => s + d.revenue, 0);
    const totalUnits = mp.reduce((s, d) => s + d.units, 0);
    const monthlyRows = mp.map(d => [
        d.month,
        '₱' + Number(d.revenue).toLocaleString(),
        Number(d.units).toLocaleString(),
        d.units > 0 ? '₱' + (d.revenue / d.units).toFixed(2) : '—',
    ]);
    monthlyRows.push([
        { content:'TOTAL', styles:{ fontStyle:'bold', fillColor:[229,231,235] } },
        { content:'₱' + Number(totalRev).toLocaleString(),   styles:{ fontStyle:'bold', fillColor:[229,231,235], halign:'right' } },
        { content:Number(totalUnits).toLocaleString(),        styles:{ fontStyle:'bold', fillColor:[229,231,235], halign:'right' } },
        { content: totalUnits > 0 ? '₱' + (totalRev/totalUnits).toFixed(2) : '—', styles:{ fontStyle:'bold', fillColor:[229,231,235], halign:'right' } },
    ]);
    drawTable(['Month','Revenue','Units Sold','Avg per Unit'], monthlyRows,
        { 0:{ cellWidth:30 }, 1:{ halign:'right' }, 2:{ halign:'right' }, 3:{ halign:'right' } });

    // 4. Top products
    if (reportData.top_products?.length) {
        sectionTitle('4. Top Performing Products');
        drawTable(['#','Product Name','Units Sold','Revenue'],
            reportData.top_products.map(p => [p.rank, p.name, Number(p.units_sold).toLocaleString(), '₱' + Number(p.revenue).toLocaleString()]),
            { 0:{ cellWidth:12, halign:'center' }, 2:{ halign:'right' }, 3:{ halign:'right', fontStyle:'bold' } });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(ACCENT);
        doc.text(`Look Good Frames · Confidential · Page ${p} of ${totalPages}`, PAGE_W/2, 292, { align:'center' });
    }

    doc.save(`lookgood_report_${new Date().getFullYear()}.pdf`);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
}

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    fetch('../adminBack_end/reportAPI.php')
        .then(res => res.json())
        .then(data => {
            reportData = data;
            renderMonthlyPerformanceChart(data.monthly_performance ?? []);
            renderSummaryStats(data);
            renderTopProducts(data.top_products ?? []);
            renderFinancial(data.financial ?? {});
        })
        .catch(err => console.error('Report API error:', err));
});
