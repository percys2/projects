import { supabase } from "../../../lib/supabase/browser";

export const kardexService = {
  async logEntry({ orgId, productId, qty, branch, cost, userId }) {
    const quantity = Number(qty);
    const costUnit = Number(cost) || 0;
    const total = costUnit * quantity;

    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      quantity: quantity,
      branch_id: branch,
      movement_type: "ENTRY",
      cost_unit: costUnit,
      total: total,
      created_by: userId,
      reference: `Entrada de ${quantity} unidades`,
    });
  },

  async logExit({ orgId, productId, qty, branch, price, cost, userId }) {
    const quantity = Number(qty);
    const costUnit = Number(cost) || 0;
    const total = costUnit * quantity;

    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      quantity: quantity * -1,
      branch_id: branch,
      from_branch: branch,
      movement_type: "EXIT",
      cost_unit: costUnit,
      total: total,
      created_by: userId,
      reference: `Salida de ${quantity} unidades`,
    });
  },

  async logTransfer({ orgId, productId, qty, from, to, cost, userId }) {
    const quantity = Number(qty);
    const costUnit = Number(cost) || 0;
    const total = costUnit * quantity;

    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      quantity: quantity,
      from_branch: from,
      to_branch: to,
      branch_id: from,
      movement_type: "TRANSFER",
      cost_unit: costUnit,
      total: total,
      created_by: userId,
      reference: `Traslado de ${quantity} unidades de ${from} a ${to}`,
    });
  },

  async logAdjustment({ orgId, productId, qty, branch, cost, userId, reason }) {
    const quantity = Number(qty);
    const costUnit = Number(cost) || 0;
    const total = costUnit * Math.abs(quantity);

    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      quantity: quantity,
      branch_id: branch,
      movement_type: "ADJUSTMENT",
      cost_unit: costUnit,
      total: total,
      created_by: userId,
      reference: reason || `Ajuste de inventario: ${quantity} unidades`,
    });
  },
};
