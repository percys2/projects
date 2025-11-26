import { supabase } from "../../../lib/supabase/browser";

export const kardexService = {
  async logEntry({ orgId, productId, qty, branch, cost, userId }) {
    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      qty,
      branch,
      type: "entrada",
      cost,
      created_by: userId,
      description: `Entrada de ${qty} unidades a ${branch}`
    });
  },

  async logExit({ orgId, productId, qty, branch, price, userId }) {
    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      qty,
      branch,
      type: "salida",
      price,
      created_by: userId,
      description: `Salida de ${qty} unidades desde ${branch}`
    });
  },

  async logTransfer({ orgId, productId, qty, from, to, userId }) {
    return await supabase.from("kardex").insert({
      org_id: orgId,
      product_id: productId,
      qty,
      from_branch: from,
      to_branch: to,
      branch: from,
      type: "traslado",
      created_by: userId,
      description: `Traslado de ${qty} unidades de ${from} a ${to}`
    });
  },
};
