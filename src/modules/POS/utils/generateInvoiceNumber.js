export function generateInvoiceNumber() {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return "FAC-" + n;
}

export async function getNextInvoiceNumber(orgSlug, branchId = null) {
  try {
    let url = "/api/pos/invoice-number";
    if (branchId) {
      url += `?branchId=${branchId}`;
    }
    const res = await fetch(url, {
      headers: { "x-org-slug": orgSlug },
    });
    const data = await res.json();
    if (data.success) {
      return data.invoiceNumber;
    }
    return null;
  } catch (err) {
    console.error("Error getting invoice number:", err);
    return null;
  }
}