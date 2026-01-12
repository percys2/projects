import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const salesService = {
  async makeSale({ orgSlug, branchId, client, cart, paymentType, notes }) {
    let orgId = localStorage.getItem("activeOrgId");
    
    if (!orgId && orgSlug) {
      const orgRes = await fetch("/api/org", {
        headers: { "x-org-slug": orgSlug },
      });
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        orgId = orgData.org_id;
        localStorage.setItem("activeOrgId", orgId);
      }
    }
    
    if (!orgId) throw new Error("Missing orgId - please select an organization.");
    if (!client?.id) throw new Error("Seleccione un cliente.");
    if (!cart || cart.length === 0) throw new Error("El carrito está vacío.");
    if (!branchId) throw new Error("Seleccione una sucursal.");

    const invoice = generateInvoiceNumber();
    const total = cart.reduce((sum, p) => sum + p.qty * p.price, 0);

    const itemsPayload = cart.map((p) => ({
      product_id: p.id || p.productId,
      quantity: p.qty,
      price: Number(p.price),
      cost: Number(p.cost ?? 0),
    }));

    const res = await fetch("/api/sales/create-with-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-branch-id": branchId,
      },
      body: JSON.stringify({
        client_id: client.id,
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

    return {
      ...data.sale,
      invoice: invoice,
      invoice_number: invoice,
      items: cart,
      total,
    };
  },
};
