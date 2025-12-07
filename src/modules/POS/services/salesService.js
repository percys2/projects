import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const salesService = {
  async makeSale({ orgSlug, branchId, client, cart, paymentType, notes }) {
    // Validate required fields
    if (!orgSlug) throw new Error("Missing orgSlug - please select an organization.");
    if (!cart || cart.length === 0) throw new Error("El carrito está vacío.");
    if (!branchId) throw new Error("Seleccione una sucursal.");

    // Client is optional - use existing client ID if provided, otherwise null
    // User requested NOT to save clients to the database for each sale
    // We save the client name in the sales table instead
    const clientId = client?.id || null;
    const clientName = client?.firstName 
      ? `${client.firstName} ${client.lastName || ''}`.trim()
      : (client?.name || null);

    const invoice = generateInvoiceNumber();
    const total = cart.reduce((sum, p) => sum + p.qty * p.price, 0);

    // Build items in the exact format the API expects
    // Use product_id from current_stock or fall back to id
    const itemsPayload = cart.map((p) => ({
      product_id: p.product_id || p.id || p.productId,
      quantity: p.qty,
      price: Number(p.price),
      cost: Number(p.cost ?? 0),
    }));

    // Make the request to the sales API
    // Uses x-org-slug header (not x-org-id) to work with getOrgContext
    const res = await fetch("/api/sales/create-with-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
        "x-branch-id": branchId,
      },
      body: JSON.stringify({
        client_id: clientId,
        client_name: clientName,
        factura: invoice,
        payment_method: paymentType || "cash",
        notes: notes || null,
        total,
        items: itemsPayload,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error creando venta.");
    }

    // Return sale with invoice
    return {
      ...data.sale,
      invoice: invoice,
      invoice_number: invoice,
      items: cart,
      total,
    };
  },
};