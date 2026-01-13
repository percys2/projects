export const clientsService = {
  async searchClients(orgSlug, query) {
    console.log("[clientsService] searchClients called with:", { orgSlug, query });
    
    if (!orgSlug) {
      console.log("[clientsService] No orgSlug provided");
      return [];
    }
    
    const res = await fetch(`/api/clients`, {
      method: "GET",
      headers: { "x-org-slug": orgSlug },
    });

    console.log("[clientsService] API response status:", res.status);

    if (!res.ok) {
      console.log("[clientsService] API error");
      return [];
    }

    const list = await res.json();
    console.log("[clientsService] Got clients:", list.length);
    
    if (!query || query.length < 2) {
      console.log("[clientsService] No query, returning first 20");
      return list.slice(0, 20);
    }

    const q = query.toLowerCase();

    const filtered = list.filter(c => {
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        c.first_name?.toLowerCase().includes(q) ||
        c.last_name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.ruc?.toLowerCase().includes(q)
      );
    });
    
    console.log("[clientsService] Filtered clients:", filtered.length);
    return filtered;
  },

  async getClientById(orgSlug, id) {
    const res = await fetch(`/api/clients/${id}`, {
      headers: { "x-org-slug": orgSlug },
    });

    return await res.json();
  },

  async createClient(orgSlug, data) {
    const res = await fetch(`/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
};
