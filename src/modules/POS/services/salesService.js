import { inventoryService } from "./inventoryService";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const salesService = {
  async makeSale({ orgId, orgSlug, branchId, client, cart, paymentType, notes }) {
    if (!orgId) throw new Error("Missing orgId");
    if (!client?.id) throw new Error("Seleccione un cliente.");
    if (!cart || cart.length === 0) throw new Error("El carrito está vacío.");

    const invoice = generateInvoiceNumber();
    const total = cart.reduce((sum, p) => sum + p.qty * p.price, 0);

    // 1️⃣ Build items in the exact format your API expects
    const itemsPayload = cart.map((p) => ({
      product_id: p.id,
      quantity: p.qty,
      price: Number(p.price),
      cost: Number(p.cost ?? 0), // MOST IMPORTANT
    }));

    // 2️⃣ Make the request to your real route
    const res = await fetch("/api/sales/create-with-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId, // API REQUIRED HEADER
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

    // 3️⃣ Decrease inventory for each item (you also do RPC)
    for (const item of cart) {
      await inventoryService.decreaseStock(
        orgSlug,
        item.id,
        branchId,
        item.qty
      );
    }

    // 4️⃣ Return sale with invoice
    return {
      ...data.sale,
      invoice_number: invoice,
      items: cart,
      total,
    };
  },
};
