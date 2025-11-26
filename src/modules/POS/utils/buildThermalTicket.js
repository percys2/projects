export function buildThermalTicket(sale) {
  const {
    invoice_number,
    created_at,
    clients,
    branches,
    sales_items,
    payment_method,
    total
  } = sale;

  const date = new Date(created_at);
  const f = date.toLocaleDateString("es-NI");
  const h = date.toLocaleTimeString("es-NI");

  let out = "";

  out += "           AGROCENTRO NICA\n";
  out += "        RUC: J0505-050505-0000\n";
  out += "   Masatepe - Tel: 8888-8888\n";
  out += "--------------------------------\n";
  out += `FACTURA #${invoice_number}\n`;
  out += `Fecha: ${f}  Hora: ${h}\n`;
  out += `Sucursal: ${branches.name}\n`;
  out += "--------------------------------\n";
  out += "CLIENTE:\n";
  out += `${clients.name}\n`;
  if (clients.ruc) out += `RUC: ${clients.ruc}\n`;
  if (clients.phone) out += `Tel: ${clients.phone}\n`;
  if (clients.address) out += `${clients.address}\n`;
  out += "--------------------------------\n";
  out += "CANT PRODUCTO         SUBTOTAL\n";
  out += "--------------------------------\n";

  for (const item of sales_items) {
    const p = item.products;
    const st = (item.quantity * item.price).toFixed(2);

    out += `${item.quantity} ${p.name.slice(0, 16).padEnd(16)} C$${st}\n`;

    if (p.lot_number) out += ` Lote: ${p.lot_number}\n`;
    if (p.expiration_date) out += ` Vence: ${p.expiration_date}\n`;
    if (p.category) out += ` Cat: ${p.category}\n`;
  }

  out += "--------------------------------\n";
  out += `TOTAL:            C$${total.toFixed(2)}\n`;
  out += "--------------------------------\n";
  out += `Pago: ${payment_method}\n`;
  out += "--------------------------------\n";
  out += "     ¡Gracias por su compra!\n";
  out += "--------------------------------\n";

  return out;
}
