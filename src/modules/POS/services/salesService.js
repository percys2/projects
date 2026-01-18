import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const salesService = {
  async makeSale({ orgSlug, branchId, client, cart, paymentType, notes }) {
    // Get orgId from orgSlug via API or use localStorage fallback
    let orgId = localStorage.getItem("activeOrgId");
    
    // If no orgId in localStorage, fetch it from the organization
    if (!orgId && orgSlug) {
      const orgRes = await fetch("/api/organizations/by-slug", {
        headers: { "x-org-slug": orgSlug },
      });
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        orgId = orgData.id;
      }
    }
    
    if (!orgId) throw new Error("Missing orgId - please select an organization.");
    if (!cart || cart.length === 0) throw new Error("El carrito está vacío.");
    if (!branchId) throw new Error("Seleccione una sucursal.");

    const total = cart.reduce((sum, p) => sum + p.qty * p.price, 0);

    // Build items in the exact format the API expects
    // Note: cart items from inventory have product_id inside products.id
    const itemsPayload = cart.map((p) => ({
      product_id: p.products?.id || p.product_id || p.productId || p.id,
      quantity: p.qty,
      price: Number(p.price),
      cost: Number(p.cost ?? 0),
    }));

    // Make the request to the sales API
    const res = await fetch("/api/sales/create-with-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-branch-id": branchId,
      },
      body: JSON.stringify({
        client_id: client?.id,
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

    // Return sale with invoice from API response (not local generation)
    return {
      ...data.sale,
      invoice: data.sale.factura,
      invoice_number: data.sale.factura,
      items: cart,
      total,
    };
  },
};