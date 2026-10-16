import { Order } from '@bambam/shared';

export const invoiceService = {
  buildInvoiceHtml(order: Order) {
    const lineItems = order.items
      .map(
        (item) =>
          `<tr><td>${item.productName} (${item.variantLabel})</td><td>${item.quantity}</td><td>Rs. ${item.totalPrice}</td></tr>`
      )
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>Bam Bam Cake Shop</h1>
          <p><strong>100% Pure Veg Bakery & Fast Food</strong></p>
          <p>Invoice for order ${order.orderNumber}</p>
          <table border="1" cellpadding="8" cellspacing="0" width="100%">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>${lineItems}</tbody>
          </table>
          <h3>Grand Total: Rs. ${order.pricing.grandTotal}</h3>
        </body>
      </html>
    `;
  }
};
