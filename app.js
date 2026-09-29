/**
 * ระบบบัญชีและสารสนเทศทางการเงิน บริษัท โบวี่สแคร์กิน จำกัด
 * จัดทำเพื่อโครงงานวิชา ACT3201 ระบบสารสนเทศทางการบัญชี (AIS)
 * ภาคเรียนที่ 1 ปีการศึกษา 2569
 * กฏเหล็ก: ห้ามใช้อิโมจิเด็ดขาด (No Emojis), รูปแบบตารางคลาสสิก, ความเป็นมนุษย์นักศึกษาบัญชี
 */

// ตรวจสอบการโหลดข้อมูล
if (typeof ACCOUNTING_DATA === 'undefined') {
  console.error('ไม่พบตัวแปร ACCOUNTING_DATA กรุณาตรวจสอบไฟล์ data.js');
}

// ตัวแปรสถานะระบบ
const state = {
  currentTab: 'dashboard',
  theme: 'classic', // 'classic' หรือ 'darkweb'
  products: {
    page: 1,
    pageSize: 25,
    category: 'ALL',
    stockAlert: 'ALL',
    search: '',
    sortCol: 'sku',
    sortAsc: true
  },
  sales: {
    page: 1,
    pageSize: 25,
    customer: 'ALL',
    status: 'ALL',
    search: '',
    sortCol: 'raw_date',
    sortAsc: true
  },
  purchases: {
    page: 1,
    pageSize: 25,
    supplier: 'ALL',
    status: 'ALL',
    search: '',
    sortCol: 'raw_date',
    sortAsc: true
  },
  expenses: {
    page: 1,
    pageSize: 25,
    category: 'ALL',
    search: '',
    sortCol: 'raw_date',
    sortAsc: true
  },
  customers: {
    search: '',
    sortCol: 'cust_id',
    sortAsc: true
  }
};

// ฟังก์ชันจัดรูปแบบตัวเลขและเงินบาท
function formatMoney(num) {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatInt(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('th-TH');
}

// ฟังก์ชันควบคุมเปิด-ปิดไซด์บาร์บนมือถือ
function openSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
}

// การเปลี่ยนแท็บหน้าจอ
function switchTab(tabId) {
  state.currentTab = tabId;
  
  // อัปเดตคลาสปุ่มเมนูในไซด์บาร์
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // อัปเดตเนื้อหาแท็บ
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === 'tab-' + tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // ปิดไซด์บาร์บนมือถือเมื่อเลือกเมนูแล้ว
  closeSidebar();

  // วาดกราฟใหม่หากอยู่หน้าแดชบอร์ด
  if (tabId === 'dashboard') {
    setTimeout(renderAllCharts, 50);
  }
}

// การสลับธีม: Windows XP <-> Dark Web
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('btn-toggle-theme');
  if (body.classList.contains('theme-darkweb')) {
    body.classList.remove('theme-darkweb');
    state.theme = 'classic';
    if (btn) btn.innerText = '[ สลับธีม: เข้าสู่โหมด ดาร์กเว็บ / เทอร์มินัล ]';
  } else {
    body.classList.add('theme-darkweb');
    state.theme = 'darkweb';
    if (btn) btn.innerText = '[ สลับธีม: กลับสู่โหมด วินโดวส์ XP คลาสสิก ]';
  }
  // วาดกราฟใหม่ตามโทนสีของธีม
  if (state.currentTab === 'dashboard') {
    renderAllCharts();
  }
}

// -------------------------------------------------------------
// 1. แดชบอร์ดสรุปผลการดำเนินงานและกราฟ (Dashboard & Charts)
// -------------------------------------------------------------
function renderDashboard() {
  const sum = ACCOUNTING_DATA.summary;
  
  // กรอกข้อมูล KPI
  const kpis = [
    { id: 'kpi-sales', val: formatMoney(sum.total_sales_net), sub: 'รวมภาษี: ' + formatMoney(sum.total_sales_grand) + ' บาท', cls: 'profit' },
    { id: 'kpi-cogs', val: formatMoney(sum.total_cogs), sub: 'ต้นทุนสินค้าที่ขายจริง', cls: '' },
    { id: 'kpi-gp', val: formatMoney(sum.gross_profit), sub: 'อัตรากำไรขั้นต้น: ' + ((sum.gross_profit / sum.total_sales_net) * 100).toFixed(1) + '%', cls: 'profit' },
    { id: 'kpi-exp', val: formatMoney(sum.total_operating_expenses), sub: 'ค่าใช้จ่ายดำเนินงาน 38 รายการ', cls: 'loss' },
    { id: 'kpi-ebit', val: formatMoney(sum.net_profit_before_tax), sub: 'กำไรก่อนหักภาษีนิติบุคคล', cls: 'profit' },
    { id: 'kpi-tax', val: formatMoney(sum.corporate_tax), sub: 'ประมาณการภาษี SME (15%)', cls: 'loss' },
    { id: 'kpi-net', val: formatMoney(sum.net_profit_after_tax), sub: 'กำไรสุทธิส่งเข้าส่วนของผู้ถือหุ้น', cls: 'profit' },
    { id: 'kpi-stock-val', val: formatMoney(sum.total_end_inventory_value), sub: 'สต็อกคงเหลือ 100 รายการ', cls: '' },
    { id: 'kpi-ar', val: formatMoney(sum.total_ar), sub: 'ลูกหนี้การค้ายังไม่ครบกำหนด', cls: 'loss' },
    { id: 'kpi-ap', val: formatMoney(sum.total_ap), sub: 'เจ้าหนี้การค้าค่าซื้อสินค้า', cls: 'loss' }
  ];

  kpis.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.innerText = item.val;
      if (item.cls) el.className = 'kpi-value ' + item.cls;
    }
    const subEl = document.getElementById(item.id + '-sub');
    if (subEl) subEl.innerText = item.sub;
  });

  renderAllCharts();
}

function renderAllCharts() {
  drawMonthlyComparisonChart();
  drawExpenseBreakdownChart();
  drawTopProductsChart();
  drawPaymentMethodsChart();
}

// กราฟที่ 1: เปรียบเทียบรายได้ ต้นทุน ค่าใช้จ่าย กำไรสุทธิ รายเดือน
function drawMonthlyComparisonChart() {
  const canvas = document.getElementById('chart-monthly');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 16;
  const height = width < 480 ? 210 : 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const isDark = document.body.classList.contains('theme-darkweb');
  const bg = isDark ? '#04080B' : '#FFFFFF';
  const textCol = isDark ? '#33FF66' : '#000000';
  const gridCol = isDark ? '#003311' : '#E0DFD8';
  const isMobile = width < 480;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // คำนวณยอดแยกตามเดือน (ส.ค., ก.ย., ต.ค. 2569)
  const monthlyData = [
    { label: isMobile ? 'ส.ค. 69' : 'ส.ค. 2569 (24-31)', sales: 0, cogs: 0, exp: 0, net: 0 },
    { label: isMobile ? 'ก.ย. 69' : 'ก.ย. 2569 (ทั้งเดือน)', sales: 0, cogs: 0, exp: 0, net: 0 },
    { label: isMobile ? 'ต.ค. 69' : 'ต.ค. 2569 (1-30)', sales: 0, cogs: 0, exp: 0, net: 0 }
  ];

  ACCOUNTING_DATA.sales.forEach(s => {
    const m = parseInt(s.raw_date.split('-')[1]);
    const idx = m === 8 ? 0 : (m === 9 ? 1 : 2);
    monthlyData[idx].sales += s.net_before_vat;
    monthlyData[idx].cogs += s.cogs;
  });

  ACCOUNTING_DATA.expenses.forEach(e => {
    const m = parseInt(e.raw_date.split('-')[1]);
    const idx = m === 8 ? 0 : (m === 9 ? 1 : 2);
    monthlyData[idx].exp += e.amount;
  });

  monthlyData.forEach(m => {
    m.net = (m.sales - m.cogs - m.exp) * 0.85; // หลังหักภาษี SME 15%
  });

  // วาดแกนและเส้นกริด
  const padLeft = isMobile ? 48 : 70;
  const padRight = isMobile ? 10 : 20;
  const padTop = 26;
  const padBottom = isMobile ? 32 : 45;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = 1000000;
  const steps = 4;

  ctx.font = isMobile ? '9px Tahoma, monospace' : '10px Tahoma, monospace';
  ctx.fillStyle = textCol;
  ctx.textAlign = 'right';

  for (let i = 0; i <= steps; i++) {
    const val = (maxVal / steps) * i;
    const y = padTop + chartH - (chartH * (val / maxVal));
    ctx.strokeStyle = gridCol;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillText((val / 1000).toFixed(0) + 'k', padLeft - 4, y + 3);
  }

  // กลุ่มแท่งกราฟ (4 แท่งต่อเดือน: ยอดขาย, ต้นทุน, ค่าใช้จ่าย, กำไรสุทธิ)
  const groupW = chartW / 3;
  const barW = (groupW - (isMobile ? 10 : 20)) / 4;
  const colors = isDark 
    ? ['#00FF66', '#FF3333', '#FFCC00', '#00CCFF']
    : ['#285EA6', '#B22222', '#C66900', '#1E7E34'];

  monthlyData.forEach((data, gIdx) => {
    const gx = padLeft + (gIdx * groupW) + (isMobile ? 5 : 10);
    const metrics = [data.sales, data.cogs, data.exp, data.net];

    metrics.forEach((val, bIdx) => {
      const bx = gx + (bIdx * barW);
      const bH = (val / maxVal) * chartH;
      const by = padTop + chartH - bH;

      ctx.fillStyle = colors[bIdx];
      ctx.fillRect(bx, by, barW - 1, bH);
      
      if (!isDark) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(bx, by, barW - 1, bH);
      }
    });

    // ป้ายเดือน
    ctx.fillStyle = textCol;
    ctx.textAlign = 'center';
    ctx.fillText(data.label, gx + (groupW - (isMobile ? 10 : 20)) / 2, height - padBottom + 14);
  });

  // คำอธิบายสีกราฟ (Legend)
  const legendItems = isMobile ? ['ขาย', 'ต้นทุน', 'จ่าย', 'กำไร'] : ['ยอดขายสุทธิ', 'ต้นทุนขาย', 'ค่าใช้จ่าย', 'กำไรสุทธิ'];
  let legX = padLeft;
  const legY = 14;
  ctx.textAlign = 'left';

  legendItems.forEach((text, i) => {
    ctx.fillStyle = colors[i];
    ctx.fillRect(legX, legY - 7, 8, 8);
    if (!isDark) {
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(legX, legY - 7, 8, 8);
    }
    ctx.fillStyle = textCol;
    ctx.fillText(text, legX + 11, legY);
    legX += ctx.measureText(text).width + (isMobile ? 14 : 24);
  });
}

// กราฟที่ 2: สัดส่วนค่าใช้จ่ายดำเนินงานตามหมวดบัญชี (Pie Chart)
function drawExpenseBreakdownChart() {
  const canvas = document.getElementById('chart-expenses');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 16;
  const height = width < 480 ? 210 : 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const isDark = document.body.classList.contains('theme-darkweb');
  const bg = isDark ? '#04080B' : '#FFFFFF';
  const textCol = isDark ? '#33FF66' : '#000000';
  const isMobile = width < 480;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // รวมค่าใช้จ่ายตามหมวด
  const catMap = {};
  let totalExp = 0;
  ACCOUNTING_DATA.expenses.forEach(e => {
    if (!catMap[e.category]) {
      catMap[e.category] = { code: e.account_code, amount: 0 };
    }
    catMap[e.category].amount += e.amount;
    totalExp += e.amount;
  });

  const catList = Object.keys(catMap).map(k => ({
    name: k,
    code: catMap[k].code,
    amount: catMap[k].amount,
    pct: (catMap[k].amount / totalExp) * 100
  })).sort((a, b) => b.amount - a.amount);

  const pieColors = isDark 
    ? ['#00FF66', '#00CCFF', '#FFCC00', '#FF3333', '#FF66CC', '#66FF66', '#3399FF', '#FF9933', '#CC66FF', '#99FF33', '#FFFF66', '#00FFCC']
    : ['#336699', '#CC3333', '#2E7D32', '#ED6C02', '#6A1B9A', '#00838F', '#AD1457', '#4E342E', '#37474F', '#0277BD', '#C2185B', '#558B2F'];

  const cx = isMobile ? 55 : 110;
  const cy = height / 2;
  const radius = isMobile ? 48 : 75;

  let startAngle = -Math.PI / 2;

  catList.forEach((item, idx) => {
    const sliceAngle = (item.amount / totalExp) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.fillStyle = pieColors[idx % pieColors.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isDark ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    startAngle = endAngle;
  });

  // แสดง Legend ตารางด้านขวา
  let lx = isMobile ? 120 : 210;
  let ly = isMobile ? 18 : 24;
  ctx.font = isMobile ? '9px Tahoma, monospace' : '10px Tahoma, monospace';
  ctx.textAlign = 'left';

  const maxItems = isMobile ? 7 : 8;
  catList.slice(0, maxItems).forEach((item, idx) => {
    ctx.fillStyle = pieColors[idx % pieColors.length];
    ctx.fillRect(lx, ly - 7, 8, 8);
    
    ctx.fillStyle = textCol;
    const nameStr = isMobile ? item.name.substring(0, 11) : item.name.substring(0, 18);
    const label = `${nameStr} (${item.pct.toFixed(0)}%) - ${(item.amount/1000).toFixed(0)}k บ.`;
    ctx.fillText(label, lx + 12, ly);
    ly += isMobile ? 19 : 22;
  });
}

// กราฟที่ 3: 10 อันดับสินค้าขายดีที่สุด (Top 10 Best Sellers)
function drawTopProductsChart() {
  const canvas = document.getElementById('chart-top-products');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 16;
  const height = width < 480 ? 210 : 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const isDark = document.body.classList.contains('theme-darkweb');
  const bg = isDark ? '#04080B' : '#FFFFFF';
  const textCol = isDark ? '#33FF66' : '#000000';
  const barCol = isDark ? '#00FF41' : '#3E6B99';
  const isMobile = width < 480;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const sorted = [...ACCOUNTING_DATA.products]
    .map(p => ({
      sku: p.sku,
      name: p.name,
      sold: p.sold_qty,
      revenue: p.sold_qty * p.sell_price
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  const maxRev = sorted[0].revenue * 1.15;
  const padLeft = isMobile ? 80 : 145;
  const padRight = isMobile ? 35 : 50;
  const chartW = width - padLeft - padRight;
  const barH = isMobile ? 15 : 18;
  const gap = isMobile ? 8 : 11;
  let topY = isMobile ? 16 : 22;

  ctx.font = isMobile ? '9px Tahoma, monospace' : '10px Tahoma, monospace';

  sorted.forEach((item, i) => {
    const y = topY + i * (barH + gap);
    const bW = (item.revenue / maxRev) * chartW;

    ctx.fillStyle = textCol;
    ctx.textAlign = 'right';
    const prodName = isMobile ? item.sku : `${item.sku} ${item.name.substring(0, 14)}`;
    ctx.fillText(prodName, padLeft - 6, y + (isMobile ? 11 : 13));

    ctx.fillStyle = barCol;
    ctx.fillRect(padLeft, y, bW, barH);
    if (!isDark) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeRect(padLeft, y, bW, barH);
    }

    ctx.textAlign = 'left';
    const valText = isMobile ? `${(item.revenue/1000).toFixed(0)}k บ.` : `${formatInt(item.revenue)} บ. (${item.sold} ชิ้น)`;
    ctx.fillText(valText, padLeft + bW + 4, y + (isMobile ? 11 : 13));
  });
}

// กราฟที่ 4: สัดส่วนช่องทางการรับชำระเงินและลูกหนี้
function drawPaymentMethodsChart() {
  const canvas = document.getElementById('chart-payments');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 16;
  const height = width < 480 ? 210 : 240;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const isDark = document.body.classList.contains('theme-darkweb');
  const bg = isDark ? '#04080B' : '#FFFFFF';
  const textCol = isDark ? '#33FF66' : '#000000';
  const isMobile = width < 480;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const payMap = {
    'โอนผ่าน บช. กสิกรไทย': 0,
    'โอนผ่าน บช. ไทยพาณิชย์': 0,
    'เงินสดหน้าร้าน': 0,
    'ยังไม่ชำระ (ลูกหนี้การค้า)': 0
  };

  let grandTotal = 0;
  ACCOUNTING_DATA.sales.forEach(s => {
    grandTotal += s.grand_total;
    if (s.status.includes('ยังไม่ชำระ')) {
      payMap['ยังไม่ชำระ (ลูกหนี้การค้า)'] += s.grand_total;
    } else if (s.payment_method.includes('กสิกร')) {
      payMap['โอนผ่าน บช. กสิกรไทย'] += s.grand_total;
    } else if (s.payment_method.includes('ไทยพาณิชย์')) {
      payMap['โอนผ่าน บช. ไทยพาณิชย์'] += s.grand_total;
    } else {
      payMap['เงินสดหน้าร้าน'] += s.grand_total;
    }
  });

  const payList = Object.keys(payMap).map(k => ({
    name: k,
    amount: payMap[k],
    pct: (payMap[k] / grandTotal) * 100
  }));

  const colors = isDark 
    ? ['#00FF66', '#00CCFF', '#FFCC00', '#FF3333']
    : ['#1E7E34', '#0056B3', '#D39E00', '#BD2130'];

  const cx = isMobile ? 55 : 110;
  const cy = height / 2;
  const radius = isMobile ? 48 : 75;

  let startAngle = -Math.PI / 2;

  payList.forEach((item, idx) => {
    const sliceAngle = (item.amount / grandTotal) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.fillStyle = colors[idx];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isDark ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();

    startAngle = endAngle;
  });

  // Legend
  let lx = isMobile ? 120 : 210;
  let ly = isMobile ? 32 : 45;
  ctx.font = isMobile ? '9px Tahoma, monospace' : '10px Tahoma, monospace';
  ctx.textAlign = 'left';

  payList.forEach((item, idx) => {
    ctx.fillStyle = colors[idx];
    ctx.fillRect(lx, ly - 7, 8, 8);
    
    ctx.fillStyle = textCol;
    const titleName = isMobile ? item.name.replace('โอนผ่าน บช. ', '').replace(' (ลูกหนี้การค้า)', '') : item.name;
    ctx.fillText(`${titleName} (${item.pct.toFixed(0)}%)`, lx + 12, ly);
    ctx.fillText(`${formatMoney(item.amount)} บ.`, lx + 12, ly + (isMobile ? 11 : 14));
    ly += isMobile ? 26 : 36;
  });
}

// -------------------------------------------------------------
// 2. ทะเบียนสินค้าเครื่องสำอาง 100 รายการ (Products Ledger)
// -------------------------------------------------------------
function renderProducts() {
  const container = document.getElementById('products-table-body');
  if (!container) return;

  const categoryFilter = state.products.category;
  const alertFilter = state.products.stockAlert;
  const search = state.products.search.toLowerCase();

  let filtered = ACCOUNTING_DATA.products.filter(p => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (alertFilter === 'LOW' && p.end_stock > p.reorder_point) return false;
    if (alertFilter === 'OK' && p.end_stock <= p.reorder_point) return false;
    if (search && !p.sku.toLowerCase().includes(search) && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

  // เรียงลำดับ
  filtered.sort((a, b) => {
    const col = state.products.sortCol;
    let va = a[col];
    let vb = b[col];
    if (typeof va === 'string') {
      return state.products.sortAsc ? va.localeCompare(vb, 'th') : vb.localeCompare(va, 'th');
    }
    return state.products.sortAsc ? va - vb : vb - va;
  });

  // Pagination
  const total = filtered.length;
  const pageSize = state.products.pageSize === 0 ? total : state.products.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  state.products.page = Math.min(state.products.page, totalPages);
  const start = (state.products.page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  let html = '';
  pageItems.forEach((p, idx) => {
    const rowNum = start + idx + 1;
    const margin = ((p.sell_price - p.cost_price) / p.sell_price * 100).toFixed(1);
    const isLow = p.end_stock <= p.reorder_point;
    const statusTag = isLow 
      ? '<span class="tag-warn">[!] จุดสั่งซื้อเพิ่ม</span>' 
      : '<span class="tag-paid">[OK] ปกติ</span>';

    html += `
      <tr>
        <td class="text-center font-mono">${rowNum}</td>
        <td class="text-center font-mono font-bold">${p.sku}</td>
        <td class="text-left font-bold">${p.name}</td>
        <td class="text-left">${p.category}</td>
        <td class="text-right font-mono">${formatMoney(p.cost_price)}</td>
        <td class="text-right font-mono">${formatMoney(p.sell_price)}</td>
        <td class="text-right font-mono">${margin}%</td>
        <td class="text-right font-mono">${formatInt(p.beg_stock)}</td>
        <td class="text-right font-mono">${formatInt(p.purchased_qty)}</td>
        <td class="text-right font-mono">${formatInt(p.sold_qty)}</td>
        <td class="text-right font-mono font-bold ${isLow ? 'tag-warn' : ''}">${formatInt(p.end_stock)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(p.end_stock_value)}</td>
        <td class="text-center">${statusTag}</td>
      </tr>
    `;
  });

  container.innerHTML = html || '<tr><td colspan="13" class="text-center">ไม่พบข้อมูลสินค้าที่ค้นหา</td></tr>';

  // อัปเดตแถบแบ่งหน้า
  const pageInfo = document.getElementById('products-page-info');
  if (pageInfo) {
    pageInfo.innerText = `แสดงรายการที่ ${total === 0 ? 0 : start + 1} - ${Math.min(start + pageSize, total)} จากทั้งหมด ${total} รายการ (หน้า ${state.products.page} / ${totalPages})`;
  }

  // อัปเดตยอดรวมใต้ตารางสินค้า
  const totalStockVal = filtered.reduce((acc, cur) => acc + cur.end_stock_value, 0);
  const totalStockQty = filtered.reduce((acc, cur) => acc + cur.end_stock, 0);
  const footerEl = document.getElementById('products-table-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="10" class="text-right font-bold">รวมมูลค่าและจำนวนสินค้าคงเหลือปลายงวด (30 ต.ค. 2569):</td>
        <td class="text-right font-mono font-bold">${formatInt(totalStockQty)} ชิ้น</td>
        <td class="text-right font-mono font-bold">${formatMoney(totalStockVal)} บาท</td>
        <td class="text-center font-bold font-mono">100 รายการ</td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 3. สมุดรายวันขายและรายรับ (Sales & Revenues)
// -------------------------------------------------------------
function renderSales() {
  const container = document.getElementById('sales-table-body');
  if (!container) return;

  const custFilter = state.sales.customer;
  const statusFilter = state.sales.status;
  const search = state.sales.search.toLowerCase();

  let filtered = ACCOUNTING_DATA.sales.filter(s => {
    if (custFilter !== 'ALL' && s.customer_id !== custFilter) return false;
    if (statusFilter === 'PAID' && s.status.includes('ยังไม่ชำระ')) return false;
    if (statusFilter === 'UNPAID' && !s.status.includes('ยังไม่ชำระ')) return false;
    if (search && !s.inv_no.toLowerCase().includes(search) && !s.customer_name.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const col = state.sales.sortCol;
    let va = a[col];
    let vb = b[col];
    return state.sales.sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const total = filtered.length;
  const pageSize = state.sales.pageSize === 0 ? total : state.sales.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  state.sales.page = Math.min(state.sales.page, totalPages);
  const start = (state.sales.page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  let html = '';
  pageItems.forEach((s, idx) => {
    const itemsDesc = s.items.map(it => `${it.sku} (${it.qty})`).join(', ');
    const isUnpaid = s.status.includes('ยังไม่ชำระ');
    const statusTag = isUnpaid 
      ? '<span class="tag-unpaid">[ค้างชำระ/ลูกหนี้]</span>' 
      : '<span class="tag-paid">[ชำระแล้ว]</span>';

    html += `
      <tr>
        <td class="text-center font-mono">${s.date}</td>
        <td class="text-center font-mono font-bold">${s.inv_no}</td>
        <td class="text-left">${s.customer_name}</td>
        <td class="text-left font-mono" title="${itemsDesc}">${itemsDesc.length > 28 ? itemsDesc.substring(0, 26) + '...' : itemsDesc}</td>
        <td class="text-right font-mono">${formatMoney(s.subtotal)}</td>
        <td class="text-right font-mono">${formatMoney(s.discount)}</td>
        <td class="text-right font-mono">${formatMoney(s.net_before_vat)}</td>
        <td class="text-right font-mono">${formatMoney(s.vat)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(s.grand_total)}</td>
        <td class="text-left">${s.payment_method}</td>
        <td class="text-center">${statusTag}</td>
      </tr>
    `;
  });

  container.innerHTML = html || '<tr><td colspan="11" class="text-center">ไม่พบรายการขายที่ตรงตามเงื่อนไข</td></tr>';

  const pageInfo = document.getElementById('sales-page-info');
  if (pageInfo) {
    pageInfo.innerText = `แสดง ${total === 0 ? 0 : start + 1} - ${Math.min(start + pageSize, total)} จากทั้งหมด ${total} รายการ (หน้า ${state.sales.page} / ${totalPages})`;
  }

  // Footer ยอดรวม
  const sumNet = filtered.reduce((acc, cur) => acc + cur.net_before_vat, 0);
  const sumVat = filtered.reduce((acc, cur) => acc + cur.vat, 0);
  const sumGrand = filtered.reduce((acc, cur) => acc + cur.grand_total, 0);
  const footerEl = document.getElementById('sales-table-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="6" class="text-right font-bold">รวมยอดขายที่แสดงในตาราง:</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumNet)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumVat)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumGrand)}</td>
        <td colspan="2" class="text-left font-bold">บาท</td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 4. สมุดรายวันซื้อสินค้าเข้าคลัง (Purchases Ledger)
// -------------------------------------------------------------
function renderPurchases() {
  const container = document.getElementById('purchases-table-body');
  if (!container) return;

  const supFilter = state.purchases.supplier;
  const statusFilter = state.purchases.status;
  const search = state.purchases.search.toLowerCase();

  let filtered = ACCOUNTING_DATA.purchases.filter(p => {
    if (supFilter !== 'ALL' && p.supplier_id !== supFilter) return false;
    if (statusFilter === 'PAID' && p.status.includes('ค้างชำระ')) return false;
    if (statusFilter === 'UNPAID' && !p.status.includes('ค้างชำระ')) return false;
    if (search && !p.po_no.toLowerCase().includes(search) && !p.supplier_name.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const col = state.purchases.sortCol;
    let va = a[col];
    let vb = b[col];
    return state.purchases.sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const total = filtered.length;
  const pageSize = state.purchases.pageSize === 0 ? total : state.purchases.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  state.purchases.page = Math.min(state.purchases.page, totalPages);
  const start = (state.purchases.page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  let html = '';
  pageItems.forEach(p => {
    const itemsDesc = p.items.map(it => `${it.sku} x${it.qty}`).join(', ');
    const isUnpaid = p.status.includes('ค้างชำระ');
    const statusTag = isUnpaid 
      ? '<span class="tag-unpaid">[เจ้าหนี้การค้า]</span>' 
      : '<span class="tag-paid">[ชำระแล้ว]</span>';

    html += `
      <tr>
        <td class="text-center font-mono">${p.date}</td>
        <td class="text-center font-mono font-bold">${p.po_no}</td>
        <td class="text-left">${p.supplier_name}</td>
        <td class="text-left font-mono" title="${itemsDesc}">${itemsDesc}</td>
        <td class="text-right font-mono">${formatMoney(p.subtotal)}</td>
        <td class="text-right font-mono">${formatMoney(p.vat)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(p.grand_total)}</td>
        <td class="text-center">${statusTag}</td>
        <td class="text-left">${p.payment_method}</td>
      </tr>
    `;
  });

  container.innerHTML = html || '<tr><td colspan="9" class="text-center">ไม่พบรายการซื้อสินค้า</td></tr>';

  const pageInfo = document.getElementById('purchases-page-info');
  if (pageInfo) {
    pageInfo.innerText = `แสดง ${total === 0 ? 0 : start + 1} - ${Math.min(start + pageSize, total)} จากทั้งหมด ${total} รายการ (หน้า ${state.purchases.page} / ${totalPages})`;
  }

  const sumSub = filtered.reduce((acc, cur) => acc + cur.subtotal, 0);
  const sumVat = filtered.reduce((acc, cur) => acc + cur.vat, 0);
  const sumGrand = filtered.reduce((acc, cur) => acc + cur.grand_total, 0);
  const footerEl = document.getElementById('purchases-table-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="4" class="text-right font-bold">รวมยอดซื้อสินค้าที่แสดง:</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumSub)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumVat)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumGrand)}</td>
        <td colspan="2" class="text-left font-bold">บาท</td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 5. ทะเบียนรายจ่ายและค่าใช้จ่ายดำเนินงาน (Expenses Ledger)
// -------------------------------------------------------------
function renderExpenses() {
  const container = document.getElementById('expenses-table-body');
  if (!container) return;

  const catFilter = state.expenses.category;
  const search = state.expenses.search.toLowerCase();

  let filtered = ACCOUNTING_DATA.expenses.filter(e => {
    if (catFilter !== 'ALL' && e.account_code !== catFilter) return false;
    if (search && !e.pv_no.toLowerCase().includes(search) && !e.description.toLowerCase().includes(search) && !e.payee.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const col = state.expenses.sortCol;
    let va = a[col];
    let vb = b[col];
    return state.expenses.sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const total = filtered.length;
  const pageSize = state.expenses.pageSize === 0 ? total : state.expenses.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  state.expenses.page = Math.min(state.expenses.page, totalPages);
  const start = (state.expenses.page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  let html = '';
  pageItems.forEach(e => {
    html += `
      <tr>
        <td class="text-center font-mono">${e.date}</td>
        <td class="text-center font-mono font-bold">${e.pv_no}</td>
        <td class="text-center font-mono">${e.account_code}</td>
        <td class="text-left">${e.category}</td>
        <td class="text-left">${e.description}</td>
        <td class="text-left">${e.payee}</td>
        <td class="text-right font-mono font-bold">${formatMoney(e.amount)}</td>
        <td class="text-left">${e.payment_method}</td>
      </tr>
    `;
  });

  container.innerHTML = html || '<tr><td colspan="8" class="text-center">ไม่พบรายการค่าใช้จ่าย</td></tr>';

  const pageInfo = document.getElementById('expenses-page-info');
  if (pageInfo) {
    pageInfo.innerText = `แสดง ${total === 0 ? 0 : start + 1} - ${Math.min(start + pageSize, total)} จากทั้งหมด ${total} รายการ (หน้า ${state.expenses.page} / ${totalPages})`;
  }

  const sumTotal = filtered.reduce((acc, cur) => acc + cur.amount, 0);
  const footerEl = document.getElementById('expenses-table-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="6" class="text-right font-bold">รวมค่าใช้จ่ายดำเนินงานที่แสดง:</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumTotal)}</td>
        <td class="text-left font-bold">บาท</td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 6. ทะเบียนลูกค้าและลูกหนี้การค้า (Customers & Receivables)
// -------------------------------------------------------------
function renderCustomers() {
  const container = document.getElementById('customers-table-body');
  if (!container) return;

  const search = state.customers.search.toLowerCase();
  let filtered = ACCOUNTING_DATA.customers.filter(c => {
    if (search && !c.cust_id.toLowerCase().includes(search) && !c.name.toLowerCase().includes(search) && !c.phone.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const col = state.customers.sortCol;
    let va = a[col];
    let vb = b[col];
    if (typeof va === 'string') {
      return state.customers.sortAsc ? va.localeCompare(vb, 'th') : vb.localeCompare(va, 'th');
    }
    return state.customers.sortAsc ? va - vb : vb - va;
  });

  let html = '';
  filtered.forEach(c => {
    const hasAR = c.total_receivable > 0;
    const arTag = hasAR 
      ? `<span class="tag-unpaid font-mono">${formatMoney(c.total_receivable)}</span>` 
      : '<span class="tag-paid font-mono">0.00</span>';

    html += `
      <tr>
        <td class="text-center font-mono font-bold">${c.cust_id}</td>
        <td class="text-left font-bold">${c.name}</td>
        <td class="text-center">${c.type}</td>
        <td class="text-center font-mono">${c.tax_id}</td>
        <td class="text-center font-mono">${c.phone}</td>
        <td class="text-left">${c.address}</td>
        <td class="text-center font-mono">${c.credit_term === 0 ? 'สด' : c.credit_term + ' วัน'}</td>
        <td class="text-right font-mono">${formatMoney(c.total_sales)}</td>
        <td class="text-right">${arTag}</td>
        <td class="text-center">${hasAR ? '<span class="tag-warn">[รอครบกำหนด]</span>' : '<span class="tag-paid">[เรียบร้อย]</span>'}</td>
      </tr>
    `;
  });

  container.innerHTML = html || '<tr><td colspan="10" class="text-center">ไม่พบข้อมูลลูกค้า</td></tr>';

  const sumSales = filtered.reduce((acc, cur) => acc + cur.total_sales, 0);
  const sumAR = filtered.reduce((acc, cur) => acc + cur.total_receivable, 0);
  const footerEl = document.getElementById('customers-table-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="7" class="text-right font-bold">รวมยอดซื้อและลูกหนี้คงค้างทั้งหมด:</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumSales)}</td>
        <td class="text-right font-mono font-bold">${formatMoney(sumAR)}</td>
        <td class="text-center font-bold">บาท</td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 7. ทะเบียนผู้จัดจำหน่าย (Suppliers)
// -------------------------------------------------------------
function renderSuppliers() {
  const container = document.getElementById('suppliers-table-body');
  if (!container) return;

  let html = '';
  ACCOUNTING_DATA.suppliers.forEach(s => {
    // คำนวณยอดซื้อสะสม
    const supPurchases = ACCOUNTING_DATA.purchases.filter(p => p.supplier_id === s.sup_id);
    const totalBuy = supPurchases.reduce((acc, cur) => acc + cur.grand_total, 0);
    const totalUnpaid = supPurchases.filter(p => p.status.includes('ค้างชำระ')).reduce((acc, cur) => acc + cur.grand_total, 0);

    html += `
      <tr>
        <td class="text-center font-mono font-bold">${s.sup_id}</td>
        <td class="text-left font-bold">${s.name}</td>
        <td class="text-left">${s.product_type}</td>
        <td class="text-center font-mono">${s.contact}</td>
        <td class="text-right font-mono font-bold">${formatMoney(totalBuy)}</td>
        <td class="text-right font-mono font-bold ${totalUnpaid > 0 ? 'tag-unpaid' : ''}">${formatMoney(totalUnpaid)}</td>
        <td class="text-center">${totalUnpaid > 0 ? '<span class="tag-unpaid">[มีหนี้ค้างจ่าย]</span>' : '<span class="tag-paid">[ชำระครบถ้วน]</span>'}</td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

// -------------------------------------------------------------
// 8. รายงานงบการเงินฉบับสมบูรณ์และงบทดลอง (Financial Statements)
// -------------------------------------------------------------
function renderFinancialReports() {
  const sum = ACCOUNTING_DATA.summary;
  
  // 1. งบกำไรขาดทุนเบ็ดเสร็จ
  const isEl = document.getElementById('income-statement-body');
  if (isEl) {
    isEl.innerHTML = `
      <tr><td class="font-bold">รายได้จากการขาย (Sales Revenue)</td><td class="text-right font-mono font-bold">${formatMoney(sum.total_sales_net)}</td></tr>
      <tr><td style="padding-left: 20px;">หัก: ต้นทุนขาย (Cost of Goods Sold - FIFO)</td><td class="text-right font-mono">(${formatMoney(sum.total_cogs)})</td></tr>
      <tr style="background-color: #ECE9D8; font-weight: bold;"><td>กำไรขั้นต้น (Gross Profit) - 53.7%</td><td class="text-right font-mono">${formatMoney(sum.gross_profit)}</td></tr>
      <tr><td colspan="2" class="font-bold" style="padding-top: 8px;">ค่าใช้จ่ายในการดำเนินงานและการบริหาร (Operating Expenses):</td></tr>
      <tr><td style="padding-left: 20px;">- ค่าเช่าอาคารสำนักงานและคลังสินค้า (52101)</td><td class="text-right font-mono">105,000.00</td></tr>
      <tr><td style="padding-left: 20px;">- เงินเดือนพนักงานฝ่ายจัดส่งและคลังสินค้า (52105)</td><td class="text-right font-mono">105,000.00</td></tr>
      <tr><td style="padding-left: 20px;">- เงินเดือนพนักงานบัญชีและการเงิน (52106)</td><td class="text-right font-mono">74,500.00</td></tr>
      <tr><td style="padding-left: 20px;">- ค่าโฆษณาและการตลาดออนไลน์ (52107)</td><td class="text-right font-mono">62,000.00</td></tr>
      <tr><td style="padding-left: 20px;">- ค่าเบี้ยประกันภัยคลังสินค้า (52112)</td><td class="text-right font-mono">37,500.00</td></tr>
      <tr><td style="padding-left: 20px;">- ค่าขนส่งพัสดุและค่ากล่องบรรจุภัณฑ์ (52108, 52109)</td><td class="text-right font-mono">42,900.00</td></tr>
      <tr><td style="padding-left: 20px;">- สาธารณูปโภค ค่าไฟ ค่าน้ำ ค่าโทรศัพท์ (52102, 52103, 52104)</td><td class="text-right font-mono">26,750.00</td></tr>
      <tr><td style="padding-left: 20px;">- ค่าเครื่องเขียนและธรรมเนียมธนาคาร (52110, 52111)</td><td class="text-right font-mono">11,800.00</td></tr>
      <tr style="background-color: #ECE9D8; font-weight: bold;"><td>รวมค่าใช้จ่ายดำเนินงาน (Total Operating Expenses)</td><td class="text-right font-mono">(${formatMoney(sum.total_operating_expenses)})</td></tr>
      <tr style="font-weight: bold;"><td>กำไรก่อนภาษีเงินได้นิติบุคคล (EBIT)</td><td class="text-right font-mono">${formatMoney(sum.net_profit_before_tax)}</td></tr>
      <tr><td style="padding-left: 20px;">หัก: ประมาณการภาษีเงินได้นิติบุคคล SME อัตรา 15%</td><td class="text-right font-mono">(${formatMoney(sum.corporate_tax)})</td></tr>
      <tr style="background-color: #D4D0C8; font-weight: bold; border-top: 2px solid #808080; border-bottom: 3px double #000000;">
        <td>กำไรสุทธิสำหรับงวด (Net Profit for the Period)</td>
        <td class="text-right font-mono tag-profit" style="font-size: 13px;">${formatMoney(sum.net_profit_after_tax)}</td>
      </tr>
    `;
  }

  // 2. งบแสดงฐานะการเงิน (Balance Sheet) ณ 30 ต.ค. 2569
  const bsEl = document.getElementById('balance-sheet-body');
  if (bsEl) {
    bsEl.innerHTML = `
      <tr style="background-color: #E2DFD6;"><th colspan="2" class="text-left">สินทรัพย์ (Assets)</th></tr>
      <tr><td class="font-bold" colspan="2">สินทรัพย์หมุนเวียน (Current Assets):</td></tr>
      <tr><td style="padding-left: 20px;">- เงินสดและเงินฝากสถาบันการเงิน (ธ.กสิกรไทย + ธ.ไทยพาณิชย์)</td><td class="text-right font-mono">1,937,020.26</td></tr>
      <tr><td style="padding-left: 20px;">- ลูกหนี้การค้าสุทธิ (Accounts Receivable)</td><td class="text-right font-mono">${formatMoney(sum.total_ar)}</td></tr>
      <tr><td style="padding-left: 20px;">- สินค้าคงเหลือปลายงวด (Ending Inventory - 100 รายการ)</td><td class="text-right font-mono">${formatMoney(sum.total_end_inventory_value)}</td></tr>
      <tr style="font-weight: bold; background-color: #F4F3EE;"><td>รวมสินทรัพย์หมุนเวียน</td><td class="text-right font-mono">4,340,109.96</td></tr>
      <tr><td class="font-bold" colspan="2" style="padding-top: 6px;">สินทรัพย์ไม่หมุนเวียน (Non-Current Assets):</td></tr>
      <tr><td style="padding-left: 20px;">- อุปกรณ์สำนักงาน คลังสินค้า และระบบคอมพิวเตอร์สุทธิ</td><td class="text-right font-mono">450,000.00</td></tr>
      <tr style="background-color: #D4D0C8; font-weight: bold; border-top: 2px solid #808080; border-bottom: 3px double #000000;">
        <td>รวมสินทรัพย์ทั้งสิ้น (Total Assets)</td>
        <td class="text-right font-mono" style="font-size: 13px;">4,790,109.96</td>
      </tr>
      
      <tr style="background-color: #E2DFD6;"><th colspan="2" class="text-left" style="padding-top: 10px;">หนี้สินและส่วนของเจ้าของ (Liabilities & Equity)</th></tr>
      <tr><td class="font-bold" colspan="2">หนี้สินหมุนเวียน (Current Liabilities):</td></tr>
      <tr><td style="padding-left: 20px;">- เจ้าหนี้การค้า (Accounts Payable)</td><td class="text-right font-mono">306,929.00</td></tr>
      <tr><td style="padding-left: 20px;">- ภาษีมูลค่าเพิ่มรอยื่นนำส่ง ภ.พ.30 (VAT Payable)</td><td class="text-right font-mono">35,531.46</td></tr>
      <tr><td style="padding-left: 20px;">- ภาษีเงินได้นิติบุคคลค้างจ่าย (Corporate Income Tax Payable)</td><td class="text-right font-mono">86,297.93</td></tr>
      <tr style="font-weight: bold; background-color: #F4F3EE;"><td>รวมหนี้สินหมุนเวียนทั้งสิ้น</td><td class="text-right font-mono">428,758.39</td></tr>
      
      <tr><td class="font-bold" colspan="2" style="padding-top: 6px;">ส่วนของเจ้าของ (Owner's Equity):</td></tr>
      <tr><td style="padding-left: 20px;">- ทุนเรือนหุ้นชำระเต็มมูลค่า (Registered Share Capital)</td><td class="text-right font-mono">2,500,000.00</td></tr>
      <tr><td style="padding-left: 20px;">- กำไรสะสมต้นงวด ณ 24 สิงหาคม 2569 (Beginning Retained Earnings)</td><td class="text-right font-mono">1,372,330.00</td></tr>
      <tr><td style="padding-left: 20px;">- กำไรสุทธิประจำงวด (24 ส.ค. - 30 ต.ค. 2569)</td><td class="text-right font-mono">${formatMoney(sum.net_profit_after_tax)}</td></tr>
      <tr style="font-weight: bold; background-color: #F4F3EE;"><td>รวมส่วนของเจ้าของทั้งสิ้น</td><td class="text-right font-mono">4,361,351.57</td></tr>
      
      <tr style="background-color: #D4D0C8; font-weight: bold; border-top: 2px solid #808080; border-bottom: 3px double #000000;">
        <td>รวมหนี้สินและส่วนของเจ้าของทั้งสิ้น (Total Liabilities & Equity)</td>
        <td class="text-right font-mono" style="font-size: 13px;">4,790,109.96</td>
      </tr>
      <tr>
        <td colspan="2" class="text-center font-bold font-mono tag-paid" style="padding: 6px; background-color: #FFFFE1;">
          [ผลการตรวจสอบความถูกต้องทางการบัญชี: สินทรัพย์ = หนี้สิน + ส่วนของเจ้าของ ดุลกันลงตัว ผลต่าง 0.00 บาท]
        </td>
      </tr>
    `;
  }

  // 3. งบทดลอง (Trial Balance) ณ 30 ต.ค. 2569
  const tbEl = document.getElementById('trial-balance-body');
  if (tbEl) {
    tbEl.innerHTML = `
      <tr><td class="text-center font-mono">11101</td><td>เงินสดในมือ</td><td class="text-right font-mono">150,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">11102</td><td>เงินฝากกระแสรายวัน ธ.กสิกรไทย</td><td class="text-right font-mono">1,187,020.26</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">11103</td><td>เงินฝากออมทรัพย์ ธ.ไทยพาณิชย์</td><td class="text-right font-mono">600,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">11201</td><td>ลูกหนี้การค้า</td><td class="text-right font-mono">677,579.70</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">11301</td><td>สินค้าคงเหลือปลายงวด (30 ต.ค. 2569)</td><td class="text-right font-mono">1,725,510.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">12101</td><td>อุปกรณ์สำนักงานและคลังสินค้า</td><td class="text-right font-mono">450,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">21101</td><td>เจ้าหนี้การค้า</td><td class="text-right font-mono">-</td><td class="text-right font-mono">306,929.00</td></tr>
      <tr><td class="text-center font-mono">21201</td><td>ภาษีมูลค่าเพิ่มรอยื่น (ภ.พ.30)</td><td class="text-right font-mono">-</td><td class="text-right font-mono">35,531.46</td></tr>
      <tr><td class="text-center font-mono">21301</td><td>ภาษีเงินได้นิติบุคคลค้างจ่าย</td><td class="text-right font-mono">-</td><td class="text-right font-mono">86,297.93</td></tr>
      <tr><td class="text-center font-mono">31101</td><td>ทุนเรือนหุ้น</td><td class="text-right font-mono">-</td><td class="text-right font-mono">2,500,000.00</td></tr>
      <tr><td class="text-center font-mono">32101</td><td>กำไรสะสมยกมา (24 ส.ค. 2569)</td><td class="text-right font-mono">-</td><td class="text-right font-mono">1,372,330.00</td></tr>
      <tr><td class="text-center font-mono">41101</td><td>รายได้จากการขายสินค้าเครื่องสำอาง</td><td class="text-right font-mono">-</td><td class="text-right font-mono">1,938,389.50</td></tr>
      <tr><td class="text-center font-mono">51101</td><td>ต้นทุนขาย (Cost of Goods Sold)</td><td class="text-right font-mono">897,620.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52101</td><td>ค่าเช่าอาคารสำนักงานและคลังสินค้า</td><td class="text-right font-mono">105,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52102</td><td>ค่าไฟฟ้า</td><td class="text-right font-mono">18,200.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52103</td><td>ค่าน้ำประปา</td><td class="text-right font-mono">2,150.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52104</td><td>ค่าโทรศัพท์และอินเทอร์เน็ต</td><td class="text-right font-mono">6,400.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52105</td><td>เงินเดือนพนักงานฝ่ายจัดส่ง</td><td class="text-right font-mono">105,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52106</td><td>เงินเดือนพนักงานฝ่ายบัญชี</td><td class="text-right font-mono">74,500.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52107</td><td>ค่าโฆษณาและการตลาด</td><td class="text-right font-mono">62,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52108</td><td>ค่ากล่องพัสดุและบรรจุภัณฑ์</td><td class="text-right font-mono">19,500.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52109</td><td>ค่าขนส่งพัสดุ</td><td class="text-right font-mono">23,400.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52110</td><td>ค่าธรรมเนียมธนาคาร</td><td class="text-right font-mono">4,800.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52111</td><td>ค่าเครื่องเขียนและวัสดุสิ้นเปลือง</td><td class="text-right font-mono">7,000.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">52112</td><td>ค่าเบี้ยประกันภัย</td><td class="text-right font-mono">37,500.00</td><td class="text-right font-mono">-</td></tr>
      <tr><td class="text-center font-mono">53101</td><td>ภาษีเงินได้นิติบุคคล</td><td class="text-right font-mono">86,297.93</td><td class="text-right font-mono">-</td></tr>
      <tr style="background-color: #D4D0C8; font-weight: bold; border-top: 2px solid #808080; border-bottom: 3px double #000000;">
        <td colspan="2" class="text-center font-bold">รวมยอดเดบิตและเครดิต (Total Dr. / Cr.)</td>
        <td class="text-right font-mono">6,239,477.89</td>
        <td class="text-right font-mono">6,239,477.89</td>
      </tr>
      <tr>
        <td colspan="4" class="text-center font-bold font-mono tag-paid" style="padding: 6px; background-color: #FFFFE1;">
          [ผลการตรวจสอบงบทดลอง: ยอดเดบิตเท่ากับยอดเครดิตอย่างสมบูรณ์ ดุลลงตัว ผลต่าง 0.00 บาท]
        </td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// 9. ส่งออกข้อมูลเป็นไฟล์ CSV (Export CSV)
// -------------------------------------------------------------
function exportCurrentTableCSV() {
  let filename = 'accounting_report.csv';
  let rows = [];

  if (state.currentTab === 'products') {
    filename = 'bowie_scareskin_products_100.csv';
    rows.push(['ลำดับ', 'รหัสสินค้า', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคาทุน (บาท)', 'ราคาขาย (บาท)', 'อัตรากำไร (%)', 'ยอดยกมา', 'ซื้อเข้า', 'ขายออก', 'คงเหลือ', 'มูลค่าคงเหลือ (บาท)', 'สถานะ']);
    ACCOUNTING_DATA.products.forEach((p, idx) => {
      const margin = ((p.sell_price - p.cost_price) / p.sell_price * 100).toFixed(1);
      rows.push([idx + 1, p.sku, p.name, p.category, p.cost_price, p.sell_price, margin, p.beg_stock, p.purchased_qty, p.sold_qty, p.end_stock, p.end_stock_value, p.end_stock <= p.reorder_point ? 'จุดสั่งซื้อเพิ่ม' : 'ปกติ']);
    });
  } else if (state.currentTab === 'sales') {
    filename = 'bowie_scareskin_sales.csv';
    rows.push(['วันที่', 'เลขที่ใบกำกับ', 'รหัสลูกค้า', 'ชื่อลูกค้า', 'มูลค่าก่อนภาษี', 'ส่วนลด', 'ภาษี 7%', 'ยอดรวมสุทธิ', 'วิธีการชำระเงิน', 'สถานะ']);
    ACCOUNTING_DATA.sales.forEach(s => {
      rows.push([s.date, s.inv_no, s.customer_id, s.customer_name, s.net_before_vat, s.discount, s.vat, s.grand_total, s.payment_method, s.status]);
    });
  } else if (state.currentTab === 'purchases') {
    filename = 'bowie_scareskin_purchases.csv';
    rows.push(['วันที่', 'เลขที่ใบสั่งซื้อ', 'รหัสผู้จำหน่าย', 'ชื่อผู้จัดจำหน่าย', 'มูลค่าก่อนภาษี', 'ภาษี 7%', 'ยอดรวมสุทธิ', 'สถานะ', 'เงื่อนไขชำระเงิน']);
    ACCOUNTING_DATA.purchases.forEach(p => {
      rows.push([p.date, p.po_no, p.supplier_id, p.supplier_name, p.subtotal, p.vat, p.grand_total, p.status, p.payment_method]);
    });
  } else if (state.currentTab === 'expenses') {
    filename = 'bowie_scareskin_expenses.csv';
    rows.push(['วันที่', 'เลขที่ใบสำคัญจ่าย', 'รหัสบัญชี', 'หมวดค่าใช้จ่าย', 'รายละเอียด', 'ผู้รับเงิน', 'จำนวนเงิน (บาท)', 'ช่องทางจ่ายเงิน']);
    ACCOUNTING_DATA.expenses.forEach(e => {
      rows.push([e.date, e.pv_no, e.account_code, e.category, e.description, e.payee, e.amount, e.payment_method]);
    });
  } else if (state.currentTab === 'customers') {
    filename = 'bowie_scareskin_customers.csv';
    rows.push(['รหัสลูกค้า', 'ชื่อลูกค้า', 'ประเภท', 'เลขผู้เสียภาษี', 'เบอร์โทร', 'ที่อยู่', 'เครดิตเทอม (วัน)', 'ยอดซื้อสะสม (บาท)', 'ลูกหนี้คงค้าง (บาท)']);
    ACCOUNTING_DATA.customers.forEach(c => {
      rows.push([c.cust_id, c.name, c.type, c.tax_id, c.phone, c.address, c.credit_term, c.total_sales, c.total_receivable]);
    });
  } else {
    filename = 'bowie_scareskin_summary.csv';
    rows.push(['รายการทางการเงิน', 'จำนวนเงิน (บาท)']);
    rows.push(['ยอดขายสุทธิ', ACCOUNTING_DATA.summary.total_sales_net]);
    rows.push(['ต้นทุนขาย', ACCOUNTING_DATA.summary.total_cogs]);
    rows.push(['กำไรขั้นต้น', ACCOUNTING_DATA.summary.gross_profit]);
    rows.push(['ค่าใช้จ่ายดำเนินงาน', ACCOUNTING_DATA.summary.total_operating_expenses]);
    rows.push(['กำไรสุทธิหลังภาษี', ACCOUNTING_DATA.summary.net_profit_after_tax]);
    rows.push(['มูลค่าสินค้าคงเหลือปลายงวด', ACCOUNTING_DATA.summary.total_end_inventory_value]);
  }

  // สร้างไฟล์ CSV พร้อม UTF-8 BOM (\uFEFF) เพื่อให้ Excel เปิดภาษาไทยได้สมบูรณ์
  let csvContent = '\uFEFF';
  rows.forEach(r => {
    const line = r.map(val => {
      let str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str}"`;
      }
      return str;
    }).join(',');
    csvContent += line + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -------------------------------------------------------------
// เริ่มต้นการทำงานเมื่อโหลดหน้าเว็บ
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // ผูกการคลิกเมนูในไซด์บาร์
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // ผูกปุ่มเปิด-ปิดไซด์บาร์บนมือถือ
  const openSidebarBtn = document.getElementById('btn-toggle-sidebar');
  if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);

  const closeSidebarBtn = document.getElementById('btn-close-sidebar');
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);

  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // ผูกปุ่มพิมพ์
  const printBtn = document.getElementById('btn-print-report');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // ผูกปุ่มส่งออก CSV
  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) exportBtn.addEventListener('click', exportCurrentTableCSV);

  // ผูกตัวกรองสินค้า
  const prodCatSelect = document.getElementById('filter-prod-cat');
  if (prodCatSelect) {
    prodCatSelect.addEventListener('change', (e) => {
      state.products.category = e.target.value;
      state.products.page = 1;
      renderProducts();
    });
  }

  const prodStockSelect = document.getElementById('filter-prod-stock');
  if (prodStockSelect) {
    prodStockSelect.addEventListener('change', (e) => {
      state.products.stockAlert = e.target.value;
      state.products.page = 1;
      renderProducts();
    });
  }

  const prodSearch = document.getElementById('search-prod');
  if (prodSearch) {
    prodSearch.addEventListener('input', (e) => {
      state.products.search = e.target.value;
      state.products.page = 1;
      renderProducts();
    });
  }

  const prodPageSize = document.getElementById('select-prod-pagesize');
  if (prodPageSize) {
    prodPageSize.addEventListener('change', (e) => {
      state.products.pageSize = parseInt(e.target.value);
      state.products.page = 1;
      renderProducts();
    });
  }

  // ผูกปุ่มเลื่อนหน้าสินค้า
  const prodPrev = document.getElementById('btn-prod-prev');
  if (prodPrev) {
    prodPrev.addEventListener('click', () => {
      if (state.products.page > 1) {
        state.products.page--;
        renderProducts();
      }
    });
  }

  const prodNext = document.getElementById('btn-prod-next');
  if (prodNext) {
    prodNext.addEventListener('click', () => {
      const total = ACCOUNTING_DATA.products.length;
      const totalPages = Math.ceil(total / (state.products.pageSize || total));
      if (state.products.page < totalPages) {
        state.products.page++;
        renderProducts();
      }
    });
  }

  // ผูกตัวกรองขาย
  const salesSearch = document.getElementById('search-sales');
  if (salesSearch) {
    salesSearch.addEventListener('input', (e) => {
      state.sales.search = e.target.value;
      state.sales.page = 1;
      renderSales();
    });
  }

  const salesStatusSelect = document.getElementById('filter-sales-status');
  if (salesStatusSelect) {
    salesStatusSelect.addEventListener('change', (e) => {
      state.sales.status = e.target.value;
      state.sales.page = 1;
      renderSales();
    });
  }

  const salesPrev = document.getElementById('btn-sales-prev');
  if (salesPrev) {
    salesPrev.addEventListener('click', () => {
      if (state.sales.page > 1) {
        state.sales.page--;
        renderSales();
      }
    });
  }

  const salesNext = document.getElementById('btn-sales-next');
  if (salesNext) {
    salesNext.addEventListener('click', () => {
      state.sales.page++;
      renderSales();
    });
  }

  // ผูกตัวกรองซื้อ
  const purSearch = document.getElementById('search-purchases');
  if (purSearch) {
    purSearch.addEventListener('input', (e) => {
      state.purchases.search = e.target.value;
      state.purchases.page = 1;
      renderPurchases();
    });
  }

  const purPrev = document.getElementById('btn-pur-prev');
  if (purPrev) {
    purPrev.addEventListener('click', () => {
      if (state.purchases.page > 1) {
        state.purchases.page--;
        renderPurchases();
      }
    });
  }

  const purNext = document.getElementById('btn-pur-next');
  if (purNext) {
    purNext.addEventListener('click', () => {
      state.purchases.page++;
      renderPurchases();
    });
  }

  // ผูกตัวกรองค่าใช้จ่าย
  const expSearch = document.getElementById('search-expenses');
  if (expSearch) {
    expSearch.addEventListener('input', (e) => {
      state.expenses.search = e.target.value;
      state.expenses.page = 1;
      renderExpenses();
    });
  }

  const expCat = document.getElementById('filter-exp-cat');
  if (expCat) {
    expCat.addEventListener('change', (e) => {
      state.expenses.category = e.target.value;
      state.expenses.page = 1;
      renderExpenses();
    });
  }

  const expPrev = document.getElementById('btn-exp-prev');
  if (expPrev) {
    expPrev.addEventListener('click', () => {
      if (state.expenses.page > 1) {
        state.expenses.page--;
        renderExpenses();
      }
    });
  }

  const expNext = document.getElementById('btn-exp-next');
  if (expNext) {
    expNext.addEventListener('click', () => {
      state.expenses.page++;
      renderExpenses();
    });
  }

  // ผูกตัวกรองลูกค้า
  const custSearch = document.getElementById('search-customers');
  if (custSearch) {
    custSearch.addEventListener('input', (e) => {
      state.customers.search = e.target.value;
      renderCustomers();
    });
  }

  // โหลดและแสดงข้อมูลเริ่มต้น
  renderDashboard();
  renderProducts();
  renderSales();
  renderPurchases();
  renderExpenses();
  renderCustomers();
  renderSuppliers();
  renderFinancialReports();

  // ปรับขนาดกราฟเมื่อหน้าจอเปลี่ยน
  window.addEventListener('resize', () => {
    if (state.currentTab === 'dashboard') {
      renderAllCharts();
    }
  });
});
