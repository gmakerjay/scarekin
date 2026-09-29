import json
import random
from datetime import datetime, timedelta

random.seed(2569)

# 1. Generate 100 Skincare Products
product_categories = [
    ("ครีมบำรุงผิวหน้า", "FACIAL_CREAM"),
    ("เซรั่มบำรุงผิว", "SERUM"),
    ("โทนเนอร์ปรับสภาพผิว", "TONER"),
    ("โฟมและเจลล้างหน้า", "CLEANSER"),
    ("คลีนซิ่งเช็ดเครื่องสำอาง", "MAKEUP_REMOVER"),
    ("ครีมกันแดด", "SUNSCREEN"),
    ("มาส์กหน้าและสครับ", "MASK_SCRUB"),
    ("อายครีมบำรุงรอบดวงตา", "EYE_CARE"),
    ("โลชั่นบำรุงผิวกาย", "BODY_LOTION"),
    ("สเปรย์น้ำแร่และมิสต์", "FACIAL_MIST")
]

# Naming style requested: "คุณ A B C บริษัท A , สกินแคร์A อะไรงี้"
# Let's generate 100 products using mock names like:
# สกินแคร์ A1, ครีม A2, เซรั่ม B1, โทนเนอร์ B2, กันแดด C1, ฯลฯ
prefix_names = [
    "สกินแคร์", "ครีมบำรุง", "เซรั่มเข้มข้น", "โทนเนอร์", "คลีนซิ่ง",
    "กันแดด", "มาส์กหน้า", "อายครีม", "โลชั่นผิว", "เจลแต้มสิว",
    "เอสเซนส์", "สครับผิว", "บาล์มบำรุง", "สเปรย์แร่", "ออยล์บำรุง"
]

letters = [chr(i) for i in range(ord('A'), ord('Z') + 1)]

products = []
sku_counter = 1

for i in range(100):
    sku = f"SK-{sku_counter:02d}"
    cat_name, cat_code = product_categories[i % len(product_categories)]
    p_prefix = prefix_names[i % len(prefix_names)]
    
    # Generate name like: สกินแคร์ A1, เซรั่ม B2, etc.
    letter_code = letters[i % len(letters)]
    sub_num = (i // len(letters)) + 1
    name = f"{p_prefix} {letter_code}{sub_num} สูตรโบวี่"
    
    cost = round(random.randint(65, 450) / 10) * 10
    margin_multiplier = random.choice([1.8, 2.0, 2.2, 2.5, 2.8])
    sell_price = round((cost * margin_multiplier) / 10) * 10
    
    # Beginning stock (as of 24 Aug 2569)
    beg_stock = random.randint(20, 80)
    reorder_point = 15
    
    products.append({
        "sku": sku,
        "name": name,
        "category": cat_name,
        "unit": "ขวด/กระปุก",
        "cost_price": cost,
        "sell_price": sell_price,
        "beg_stock": beg_stock,
        "purchased_qty": 0,
        "sold_qty": 0,
        "end_stock": beg_stock,
        "reorder_point": reorder_point
    })
    sku_counter += 1

print(f"Generated {len(products)} products.")

# 2. Generate Customers
# Names like: คุณ A, คุณ B, ... บริษัท A, ร้านสกินแคร์ B, คลินิกความงาม C
customers = []
for i in range(26):
    let = letters[i]
    if i < 15:
        c_name = f"คุณ {let}"
        c_type = "บุคคลธรรมดา"
        tax_id = f"1100{i+1:02d}876543{i%10}"
    elif i < 22:
        c_name = f"บริษัท {let} บิวตี้เทรดดิ้ง จำกัด"
        c_type = "นิติบุคคล"
        tax_id = f"01055{i+1:02d}98765{i%10}"
    else:
        c_name = f"ร้านสกินแคร์ {let}"
        c_type = "ร้านค้าส่ง/ปลีก"
        tax_id = f"3100{i+1:02d}12345{i%10}"
    
    customers.append({
        "cust_id": f"C-{i+1:02d}",
        "name": c_name,
        "type": c_type,
        "phone": f"08{random.randint(1,9)}-{random.randint(100,999)}-{random.randint(1000,9999)}",
        "address": f"{random.randint(10,999)}/{random.randint(1,50)} ถนนมิตรภาพ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ",
        "tax_id": tax_id,
        "credit_term": random.choice([0, 15, 30]),
        "total_sales": 0,
        "total_receivable": 0
    })

# Add 4 more corporate clients for depth
customers.append({"cust_id": "C-27", "name": "คลินิกความงาม AA", "type": "นิติบุคคล", "phone": "02-541-1122", "address": "128/9 สยามสแควร์วัน ปทุมวัน กทม.", "tax_id": "0105562014521", "credit_term": 30, "total_sales": 0, "total_receivable": 0})
customers.append({"cust_id": "C-28", "name": "หจก. เครื่องสำอาง BB", "type": "นิติบุคคล", "phone": "053-221-889", "address": "45 ถนนนิมมานเหมินท์ ต.สุเทพ อ.เมือง จ.เชียงใหม่", "tax_id": "0503559001244", "credit_term": 15, "total_sales": 0, "total_receivable": 0})
customers.append({"cust_id": "C-29", "name": "คุณ CC (ตัวแทนรายใหญ่)", "type": "บุคคลธรรมดา", "phone": "089-771-4455", "address": "88/14 หมู่บ้านปัญญารามอินทรา คันนายาว กทม.", "tax_id": "1103700412891", "credit_term": 30, "total_sales": 0, "total_receivable": 0})
customers.append({"cust_id": "C-30", "name": "บริษัท สกินแคร์ดีดี จำกัด", "type": "นิติบุคคล", "phone": "02-998-3344", "address": "909 อาคารเอ็กซ์เชนจ์ทาวเวอร์ สุขุมวิท คลองเตย กทม.", "tax_id": "0105558043219", "credit_term": 30, "total_sales": 0, "total_receivable": 0})

# 3. Generate Suppliers
# บริษัท A, โรงงาน B, ฯลฯ
suppliers = [
    {"sup_id": "S-01", "name": "บริษัท วัตถุดิบสกินแคร์ A จำกัด", "product_type": "หัวเชื้อสารสกัดและสารออกฤทธิ์", "contact": "02-123-4567"},
    {"sup_id": "S-02", "name": "โรงงานแล็บเครื่องสำอาง B จำกัด", "product_type": "รับจ้างผลิตครีมและเซรั่ม OEM", "contact": "02-234-5678"},
    {"sup_id": "S-03", "name": "บริษัท บรรจุภัณฑ์ขวดและกระปุก C จำกัด", "product_type": "บรรจุภัณฑ์ขวดดรอปเปอร์/กระปุกอะคริลิก", "contact": "02-345-6789"},
    {"sup_id": "S-04", "name": "หจก. ฉลากและกล่องพิมพ์ D", "product_type": "กล่องบรรจุภัณฑ์และฉลากกันน้ำ", "contact": "02-456-7890"},
    {"sup_id": "S-05", "name": "บริษัท เคมีคอลไทย E จำกัด", "product_type": "สารกันเสียธรรมชาติและวิตามินอี", "contact": "02-567-8901"},
    {"sup_id": "S-06", "name": "บริษัท สมุนไพรและสกินแล็บ F จำกัด", "product_type": "สารสกัดสมุนไพรเกรดพรีเมียม", "contact": "02-678-9012"}
]

# Dates range: 24 สิงหาคม 2569 ถึง 30 ตุลาคม 2569
# 2026-08-24 to 2026-10-30
start_date = datetime(2026, 8, 24)
end_date = datetime(2026, 10, 30)
days_range = (end_date - start_date).days

# 4. Generate Purchase Orders (บันทึกซื้อสินค้า)
purchases = []
po_counter = 1

curr_date = start_date
while curr_date <= end_date:
    # 1-3 purchase orders per week
    if random.random() < 0.45:
        sup = random.choice(suppliers)
        # Select 2-5 products to restock
        items_count = random.randint(2, 5)
        selected_prods = random.sample(products, items_count)
        
        po_items = []
        po_subtotal = 0
        for p in selected_prods:
            qty = random.choice([20, 30, 50, 80, 100])
            unit_cost = p["cost_price"]
            total_item = qty * unit_cost
            po_subtotal += total_item
            p["purchased_qty"] += qty
            po_items.append({
                "sku": p["sku"],
                "name": p["name"],
                "qty": qty,
                "unit_cost": unit_cost,
                "total": total_item
            })
            
        vat = round(po_subtotal * 0.07, 2)
        grand_total = round(po_subtotal + vat, 2)
        paid = random.random() < 0.85 # most paid, some AP
        thai_year = curr_date.year + 543
        doc_no = f"PO-{po_counter:02d}"
        
        purchases.append({
            "po_no": doc_no,
            "date": f"{curr_date.day:02d}/{curr_date.month:02d}/{thai_year}",
            "raw_date": curr_date.strftime("%Y-%m-%d"),
            "supplier_id": sup["sup_id"],
            "supplier_name": sup["name"],
            "items": po_items,
            "subtotal": po_subtotal,
            "vat": vat,
            "grand_total": grand_total,
            "status": "ชำระเงินแล้ว" if paid else "ค้างชำระ (เจ้าหนี้)",
            "payment_method": "โอนผ่าน บช. กสิกรไทย" if paid else "รอครบกำหนดชำระ 30 วัน"
        })
        po_counter += 1
    curr_date += timedelta(days=1)

print(f"Generated {len(purchases)} purchase orders.")

# 5. Generate Sales Records (บันทึกการขายและรายรับ)
sales = []
inv_counter = 1

curr_date = start_date
while curr_date <= end_date:
    # 2-5 sales invoices per day
    daily_sales_count = random.randint(1, 4) if curr_date.weekday() < 5 else random.randint(2, 5)
    
    for _ in range(daily_sales_count):
        cust = random.choice(customers)
        items_count = random.randint(1, 4)
        selected_prods = random.sample(products, items_count)
        
        inv_items = []
        inv_subtotal = 0
        inv_cogs = 0
        
        for p in selected_prods:
            # Check availability
            avail = p["beg_stock"] + p["purchased_qty"] - p["sold_qty"]
            if avail <= 2:
                continue
            qty = random.randint(1, min(15, avail - 1))
            unit_price = p["sell_price"]
            total_item = qty * unit_price
            inv_subtotal += total_item
            inv_cogs += qty * p["cost_price"]
            p["sold_qty"] += qty
            inv_items.append({
                "sku": p["sku"],
                "name": p["name"],
                "qty": qty,
                "unit_price": unit_price,
                "unit_cost": p["cost_price"],
                "total": total_item
            })
            
        if not inv_items:
            continue
            
        discount = 0
        if inv_subtotal > 5000:
            discount = round(inv_subtotal * 0.05, 2)
            
        net_before_vat = round(inv_subtotal - discount, 2)
        vat = round(net_before_vat * 0.07, 2)
        grand_total = round(net_before_vat + vat, 2)
        
        # Payment status
        if cust["credit_term"] > 0 and random.random() < 0.4:
            status = "ยังไม่ชำระ (ลูกหนี้)"
            pay_method = f"เครดิต {cust['credit_term']} วัน"
            cust["total_receivable"] += grand_total
        else:
            status = "ชำระเงินแล้ว"
            pay_method = random.choice(["โอนผ่าน บช. กสิกรไทย", "โอนผ่าน บช. ไทยพาณิชย์", "เงินสดหน้าร้าน"])
            
        cust["total_sales"] += grand_total
        
        thai_year = curr_date.year + 543
        doc_no = f"INV-{inv_counter:02d}"
        
        sales.append({
            "inv_no": doc_no,
            "date": f"{curr_date.day:02d}/{curr_date.month:02d}/{thai_year}",
            "raw_date": curr_date.strftime("%Y-%m-%d"),
            "customer_id": cust["cust_id"],
            "customer_name": cust["name"],
            "items": inv_items,
            "subtotal": inv_subtotal,
            "discount": discount,
            "net_before_vat": net_before_vat,
            "vat": vat,
            "grand_total": grand_total,
            "cogs": inv_cogs,
            "status": status,
            "payment_method": pay_method
        })
        inv_counter += 1
        
    curr_date += timedelta(days=1)

print(f"Generated {len(sales)} sales records.")

# Recalculate end_stock for all products
for p in products:
    p["end_stock"] = p["beg_stock"] + p["purchased_qty"] - p["sold_qty"]
    p["end_stock_value"] = p["end_stock"] * p["cost_price"]

# 6. Generate Operating Expenses (ค่าใช้จ่ายดำเนินงาน)
expense_types = [
    ("52101", "ค่าเช่าอาคารสำนักงานและคลังสินค้า", 35000, "เจ้าของอาคาร (คุณ A)"),
    ("52102", "ค่าไฟฟ้าสำนักงานและคลัง", (4500, 7800), "การไฟฟ้านครหลวง"),
    ("52103", "ค่าน้ำประปา", (400, 950), "การประปานครหลวง"),
    ("52104", "ค่าบริการอินเทอร์เน็ตความเร็วสูงและโทรศัพท์", (1800, 2500), "บมจ. โทรคมนาคมแห่งชาติ (NT)"),
    ("52105", "เงินเดือนพนักงานฝ่ายจัดส่งและคลังสินค้า", 45000, "พนักงานฝ่ายคลัง (3 ท่าน)"),
    ("52106", "เงินเดือนพนักงานบัญชีและการเงิน", 32000, "พนักงานฝ่ายบัญชี (2 ท่าน)"),
    ("52107", "ค่าโฆษณาและการตลาดออนไลน์", (12000, 28000), "บริษัท ดิจิทัลมาร์เก็ตติ้ง เอเจนซี่ จำกัด"),
    ("52108", "ค่ากล่องพัสดุ ซองบับเบิ้ล และเทปกาว", (3500, 8500), "ร้านบรรจุภัณฑ์ มีสุข"),
    ("52109", "ค่าขนส่งพัสดุส่งด่วนให้ลูกค้า", (4200, 9800), "บริษัท แฟลช เอ็กซ์เพรส จำกัด"),
    ("52110", "ค่าธรรมเนียมธนาคารและระบบชำระเงิน", (850, 1950), "ธนาคารกสิกรไทย / ไทยพาณิชย์"),
    ("52111", "ค่าเครื่องเขียนและวัสดุสิ้นเปลืองสำนักงาน", (1200, 3100), "บมจ. ซีพี แอ็กซ์ตร้า (แม็คโคร)"),
    ("52112", "ค่าเบี้ยประกันอัคคีภัยคลังสินค้า", 12500, "บริษัท ทิพยประกันภัย จำกัด (มหาชน)")
]

expenses = []
pv_counter = 1

# Monthly recurring expenses for Aug, Sep, Oct
for m_idx, (m_name, m_num, m_days) in enumerate([("สิงหาคม", 8, 31), ("กันยายน", 9, 30), ("ตุลาคม", 10, 31)]):
    # Rent on 25th of month (only for Aug if >= 24)
    if m_num == 8:
        # Aug rent
        rent_date = datetime(2026, 8, 25)
    else:
        rent_date = datetime(2026, m_num, 5)
        
    thai_yr = rent_date.year + 543
    doc_no = f"PV-{thai_yr % 100}{rent_date.month:02d}-{pv_counter:03d}"
    pv_counter += 1
    expenses.append({
        "pv_no": doc_no,
        "date": f"{rent_date.day:02d}/{rent_date.month:02d}/{thai_yr}",
        "raw_date": rent_date.strftime("%Y-%m-%d"),
        "account_code": "52101",
        "category": "ค่าเช่าอาคารสำนักงานและคลังสินค้า",
        "description": f"จ่ายค่าเช่าอาคารสำนักงานและคลังสินค้า ประจำเดือน{m_name} 2569",
        "payee": "เจ้าของอาคาร (คุณ A)",
        "amount": 35000,
        "payment_method": "โอนผ่าน บช. กสิกรไทย"
    })
    
    # Salaries at end of month
    sal_day = min(m_days, 30 if m_num == 10 else 28)
    sal_date = datetime(2026, m_num, sal_day)
    thai_yr = sal_date.year + 543
    
    expenses.append({
        "pv_no": f"PV-{thai_yr % 100}{sal_date.month:02d}-{pv_counter:03d}",
        "date": f"{sal_date.day:02d}/{sal_date.month:02d}/{thai_yr}",
        "raw_date": sal_date.strftime("%Y-%m-%d"),
        "account_code": "52105",
        "category": "เงินเดือนพนักงานฝ่ายจัดส่งและคลังสินค้า",
        "description": f"จ่ายเงินเดือนพนักงานฝ่ายคลังสินค้าและแพ็ค ประจำเดือน{m_name} 2569",
        "payee": "พนักงานฝ่ายคลัง (3 ท่าน)",
        "amount": 45000 if m_num != 8 else 15000, # proration for Aug
        "payment_method": "โอนเข้าบัญชีพนักงาน (กสิกรไทย)"
    })
    pv_counter += 1
    
    expenses.append({
        "pv_no": f"PV-{thai_yr % 100}{sal_date.month:02d}-{pv_counter:03d}",
        "date": f"{sal_date.day:02d}/{sal_date.month:02d}/{thai_yr}",
        "raw_date": sal_date.strftime("%Y-%m-%d"),
        "account_code": "52106",
        "category": "เงินเดือนพนักงานบัญชีและการเงิน",
        "description": f"จ่ายเงินเดือนพนักงานแผนกบัญชีและการเงิน ประจำเดือน{m_name} 2569",
        "payee": "พนักงานฝ่ายบัญชี (2 ท่าน)",
        "amount": 32000 if m_num != 8 else 10500,
        "payment_method": "โอนเข้าบัญชีพนักงาน (กสิกรไทย)"
    })
    pv_counter += 1

# Additional ad-hoc and utilities throughout the period
curr_date = start_date
while curr_date <= end_date:
    if random.random() < 0.40:
        # Pick a non-salary, non-rent expense
        exp_candidates = [e for e in expense_types if e[0] not in ("52101", "52105", "52106")]
        acct_code, cat, amt_spec, payee = random.choice(exp_candidates)
        
        if isinstance(amt_spec, tuple):
            amt = round(random.randint(amt_spec[0], amt_spec[1]) / 50) * 50
        else:
            amt = amt_spec
            
        thai_yr = curr_date.year + 543
        doc_no = f"PV-{thai_yr % 100}{curr_date.month:02d}-{pv_counter:03d}"
        pv_counter += 1
        
        expenses.append({
            "pv_no": doc_no,
            "date": f"{curr_date.day:02d}/{curr_date.month:02d}/{thai_yr}",
            "raw_date": curr_date.strftime("%Y-%m-%d"),
            "account_code": acct_code,
            "category": cat,
            "description": f"จ่าย{cat} งวดประจำวันที่ {curr_date.day:02d}/{curr_date.month:02d}",
            "payee": payee,
            "amount": amt,
            "payment_method": random.choice(["โอนผ่าน บช. กสิกรไทย", "เงินสดย่อย", "โอนผ่าน บช. ไทยพาณิชย์"])
        })
    curr_date += timedelta(days=1)

# Sort expenses by raw_date
expenses.sort(key=lambda x: x["raw_date"])
# Re-number PVs chronologically
for i, exp in enumerate(expenses, 1):
    exp["pv_no"] = f"PV-{i:02d}"

print(f"Generated {len(expenses)} expense entries.")

# Summary calculations
total_sales_revenue = sum(s["grand_total"] for s in sales)
total_sales_net = sum(s["net_before_vat"] for s in sales)
total_sales_vat = sum(s["vat"] for s in sales)
total_cogs = sum(s["cogs"] for s in sales)
gross_profit = total_sales_net - total_cogs

total_purchases_grand = sum(p["grand_total"] for p in purchases)
total_purchases_sub = sum(p["subtotal"] for p in purchases)
total_purchases_vat = sum(p["vat"] for p in purchases)

total_operating_expenses = sum(e["amount"] for e in expenses)
net_profit_before_tax = gross_profit - total_operating_expenses
corporate_tax = round(max(0, net_profit_before_tax * 0.15), 2)
net_profit_after_tax = round(net_profit_before_tax - corporate_tax, 2)

total_beg_inventory_value = sum(p["beg_stock"] * p["cost_price"] for p in products)
total_end_inventory_value = sum(p["end_stock_value"] for p in products)
total_ar = sum(c["total_receivable"] for c in customers)
total_ap = sum(p["grand_total"] for p in purchases if "ค้างชำระ" in p["status"])

print("--- FINANCIAL SUMMARY (24/08/2569 - 30/10/2569) ---")
print(f"Total Sales (Net of VAT): {total_sales_net:,.2f}")
print(f"Total COGS: {total_cogs:,.2f}")
print(f"Gross Profit: {gross_profit:,.2f} ({gross_profit/total_sales_net*100:.1f}%)")
print(f"Total Operating Expenses: {total_operating_expenses:,.2f}")
print(f"Net Profit Before Tax: {net_profit_before_tax:,.2f}")
print(f"Corporate Tax (15% SME): {corporate_tax:,.2f}")
print(f"Net Profit After Tax: {net_profit_after_tax:,.2f}")
print(f"Ending Inventory Value: {total_end_inventory_value:,.2f}")
print(f"Total AR: {total_ar:,.2f}")
print(f"Total AP: {total_ap:,.2f}")

# Save to data.json
data = {
    "company": {
        "name_th": "บริษัท โบวี่สแคร์กิน จำกัด",
        "name_en": "BOWIE SCARESKIN CO., LTD.",
        "tax_id": "0105569082401",
        "address": "เลขที่ 124/8 ชั้น 3 อาคารบิวตี้ทาวเวอร์ ถนนรัชดาภิเษก แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
        "tel": "02-987-6543, 081-234-5678",
        "period_start": "24/08/2569",
        "period_end": "30/10/2569",
        "fiscal_year": "2569",
        "project_notice": "โปรเจคนี้เป็นโปรเจคเพื่อนำส่ง / พรีเซ้นต์ในภาควิชาการบัญชีเท่านั้น ข้อมูลทุกอย่างคือการสมมติขึ้นมา"
    },
    "summary": {
        "total_sales_net": total_sales_net,
        "total_sales_grand": total_sales_revenue,
        "total_sales_vat": total_sales_vat,
        "total_cogs": total_cogs,
        "gross_profit": gross_profit,
        "total_operating_expenses": total_operating_expenses,
        "net_profit_before_tax": net_profit_before_tax,
        "corporate_tax": corporate_tax,
        "net_profit_after_tax": net_profit_after_tax,
        "total_beg_inventory_value": total_beg_inventory_value,
        "total_end_inventory_value": total_end_inventory_value,
        "total_ar": total_ar,
        "total_ap": total_ap
    },
    "products": products,
    "customers": customers,
    "suppliers": suppliers,
    "sales": sales,
    "purchases": purchases,
    "expenses": expenses
}

with open("accounting_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved accounting_data.json successfully.")
