export function generateInvoiceNumber() {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return "FAC-" + n;
}
