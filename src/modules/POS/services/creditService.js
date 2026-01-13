export const creditService = {
  async getCreditClients(orgSlug) {
    const res = await fetch("/api/credits", {
      headers: { "x-org-slug": orgSlug },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al obtener clientes de crédito");
    }
    return res.json();
  },

  async getClientCreditHistory(orgSlug, clientId) {
    const res = await fetch(`/api/credits?clientId=${clientId}`, {
      headers: { "x-org-slug": orgSlug },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al obtener historial de crédito");
    }
    return res.json();
  },

  async registerPayment(orgSlug, branchId, clientId, amount, paymentMethod, notes) {
    console.log("[creditService] registerPayment:", { orgSlug, branchId, clientId, amount });
    
    const res = await fetch("/api/credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
        "x-branch-id": branchId || "",
      },
      body: JSON.stringify({
        action: "payment",
        clientId,
        amount,
        paymentMethod,
        notes,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al registrar pago");
    }
    return res.json();
  },

  async updateCreditSettings(orgSlug, clientId, isCreditClient, creditLimit) {
    const res = await fetch("/api/credits", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify({
        clientId,
        isCreditClient,
        creditLimit,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al actualizar configuración de crédito");
    }
    return res.json();
  },

  canPurchaseOnCredit(client, amount) {
    if (!client?.is_credit_client) return { allowed: false, reason: "Cliente no tiene crédito habilitado" };
    
    const balance = client.credit_balance || 0;
    const limit = client.credit_limit || 0;
    const available = limit - balance;
    
    if (amount > available) {
      return { 
        allowed: false, 
        reason: `Excede el crédito disponible. Disponible: C$ ${available.toFixed(2)}`,
        available 
      };
    }
    
    return { allowed: true, available };
  },
};
