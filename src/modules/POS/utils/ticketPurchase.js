/* 
  UNIVERSAL ESC/POS TICKET: PURCHASE ENTRY
  For Epson / Bixolon / StarMicronics / Sunmi
  80mm layout
*/

export function buildPurchaseTicket(purchase) {
  // purchase = {
  //   orgName, orgRuc, orgAddress, orgPhone,
  //   entryNumber, 
  //   date,
  //   supplierName,
  //   userName,
  //   items: [{ name, qty, cost }],
  //   totalCost,
  //   notes
  // }

  const encoder = new TextEncoder();
  let t = "";

  t += "\x1B\x40"; // init
  t += "\x1B\x61\x01"; // center

  t += `${purchase.orgName}\n`;
  t += `RUC: ${purchase.orgRuc || "N/A"}\n`;
  if (purchase.orgPhone) t += `Tel: ${purchase.orgPhone}\n`;
  if (purchase.orgAddress) t += `${purchase.orgAddress}\n`;
  t += "-----------------------------\n";
  t += "  ** ENTRADA DE INVENTARIO **\n";
  t += "-----------------------------\n";

  t += "\x1B\x61\x00"; // left

  t += `Ingreso #: ${purchase.entryNumber}\n`;
  t += `Fecha: ${purchase.date}\n`;
  t += `Proveedor: ${purchase.supplierName}\n`;
  t += `Usuario: ${purchase.userName}\n`;
  t += "-----------------------------\n";

  purchase.items.forEach((i) => {
    t += `${i.name}\n`;
    t += `  ${i.qty} x C$ ${i.cost.toFixed(2)} = C$ ${(i.qty * i.cost).toFixed(2)}\n`;
  });

  t += "-----------------------------\n";
  t += `Total Costo: C$ ${purchase.totalCost.toFixed(2)}\n`;
  t += "-----------------------------\n";

  if (purchase.notes) {
    t += `Nota: ${purchase.notes}\n`;
    t += "-----------------------------\n";
  }

  t += "\x1B\x61\x01"; // center
  t += "Entrada registrada correctamente\n";
  t += "Gracias\n\n\n\n";
  t += "\x1D\x56\x42\x00"; // cut

  return encoder.encode(t);
}
