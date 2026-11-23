export interface InvoiceItem {
  name: string;
  variant?: string | null;
  quantity?: number;
  qty?: number;
  price: number;
}

export interface InvoiceOrder {
  orderId: string;
  customerName: string;
  phone: string;
  addressText: string;
  items: InvoiceItem[];
  subtotal?: number;
  packingCharge?: number;
  deliveryCharge?: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  utr?: string;
  status?: string;
}

export function printOrderInvoice(order: InvoiceOrder) {
  const rows = (order.items || [])
    .map((it) => {
      const q = Number(it.quantity ?? it.qty ?? 1);
      const lineTotal = Number(it.price || 0) * q;
      return `
        <tr>
          <td>${it.name}${it.variant ? ` (${it.variant})` : ""}</td>
          <td style="text-align:center;">${q}</td>
          <td style="text-align:right;">₹${Number(it.price || 0).toLocaleString("en-IN")}</td>
          <td style="text-align:right;">₹${lineTotal.toLocaleString("en-IN")}</td>
        </tr>`;
    })
    .join("");

  const win = window.open("", "_blank", "width=800,height=750");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #071410; font-size: 13px; }
          .top { display: flex; justify-content: space-between; border-bottom: 2px solid #C9A45C; padding-bottom: 12px; }
          .brand { font-size: 22px; font-weight: bold; letter-spacing: -0.5px; }
          .sub { font-size: 11px; color: #555; }
          .box { margin-top: 16px; background: #FAF8F3; padding: 12px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border-bottom: 1px solid #ddd; padding: 9px 6px; text-align: left; }
          th { background: #071410; color: #FFFDF2; font-size: 12px; }
          .totals { margin-top: 16px; width: 280px; margin-left: auto; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
          .grand { font-size: 16px; font-weight: bold; border-top: 2px solid #071410; padding-top: 8px !important; margin-top: 6px; }
          .foot { margin-top: 32px; font-size: 11px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <div class="brand">LENKA STORE</div>
            <div class="sub">Lenka Ventures • +91 89776 27028 • vardhansai8116@gmail.com</div>
          </div>
          <div style="text-align:right;">
            <strong>INVOICE</strong><br/>
            <span style="font-family:monospace;">${order.orderId}</span><br/>
            <span class="sub">Status: ${order.status || "PENDING_VERIFICATION"}</span>
          </div>
        </div>

        <div class="box">
          <strong>Billed &amp; Shipped To:</strong><br/>
          ${order.customerName} • +91 ${order.phone}<br/>
          ${order.addressText || "-"}<br/>
          ${order.utr ? `<strong>UPI UTR:</strong> ${order.utr}` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          ${order.subtotal !== undefined ? `<div><span>Subtotal</span><span>₹${Number(order.subtotal).toLocaleString("en-IN")}</span></div>` : ""}
          ${order.packingCharge ? `<div><span>Packing</span><span>₹${Number(order.packingCharge).toLocaleString("en-IN")}</span></div>` : ""}
          ${order.deliveryCharge ? `<div><span>Delivery</span><span>₹${Number(order.deliveryCharge).toLocaleString("en-IN")}</span></div>` : ""}
          ${order.discountAmount ? `<div style="color:#0a7;"><span>Discount ${order.couponCode ? `(${order.couponCode})` : ""}</span><span>-₹${Number(order.discountAmount).toLocaleString("en-IN")}</span></div>` : ""}
          <div class="grand"><span>Grand Total</span><span>₹${Number(order.totalAmount).toLocaleString("en-IN")}</span></div>
        </div>

        <div class="foot">Thank you for shopping with LENKA STORE!</div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
    </html>
  `);
  win.document.close();
}
