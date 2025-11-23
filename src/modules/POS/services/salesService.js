import { inventoryService } from "./inventoryService";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const salesService = {
  async makeSale({ orgSlug, orgId, client, cart, paymentType, branch, branchId }) {
    if (!client) throw new Error("Seleccione un cliente.");
    if (cart.length === 0) throw new Error("El carrito está vacío.");
    if (!orgSlug || !orgId) throw new Error("Organization information is required.");

    const invoice = generateInvoiceNumber();
    const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

    try {
      // Create the sale record
      const saleResponse = await fetch(`/api/sales?slug=${orgSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-slug': orgSlug,
        },
        body: JSON.stringify({
          invoice_number: invoice,
          client_id: client.id,
          client_name: client.name,
          branch_id: branchId,
          payment_method: paymentType,
          total,
          status: 'completed',
          created_at: new Date().toISOString(),
        }),
      });

      if (!saleResponse.ok) {
        const error = await saleResponse.json();
        throw new Error(error.error || 'Failed to create sale');
      }

      const sale = await saleResponse.json();

      // Create sale items and update inventory for each cart item
      for (const item of cart) {
        // Create sale item record
        await fetch(`/api/sales-items?slug=${orgSlug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-slug': orgSlug,
          },
          body: JSON.stringify({
            sale_id: sale.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.qty,
            unit_price: item.price,
            subtotal: item.qty * item.price,
          }),
        });

        // Decrease inventory stock
        await inventoryService.decreaseStock(
          orgSlug,
          item.id,
          branchId,
          item.qty
        );
      }

      return {
        ...sale,
        invoice,
        items: cart,
      };
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },
};