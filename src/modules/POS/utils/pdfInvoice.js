export function generateInvoicePdf(sale) {
  const lines = [];

  lines.push("AGROCENTRO NICA");
  lines.push("FACTURA #" + sale.id);
  lines.push("--------------------------------");
  lines.push("Cliente: " + sale.customer.name);
  lines.push("Fecha: " + new Date(sale.date).toLocaleString("es-NI"));
  lines.push("--------------------------------");
  sale.items.forEach((item) => {
    lines.push(
      `${item.qty} x ${item.name} — C$${item.price} = C$${item.qty * item.price}`
    );
  });
  lines.push("--------------------------------");
  lines.push("TOTAL: C$" + sale.total);

  return lines.join("\n");
}
