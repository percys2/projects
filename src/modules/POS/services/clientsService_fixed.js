export const clientsService = {
  async searchClients(orgSlug, query) {
    if (!orgSlug) return [];
    if (!query || query.length < 2) return [];

    const res = await fetch(`/api/clients`, {
      method: "GET",
      headers: { "x-org-slug": orgSlug },
    });

    if (!res.ok) return [];

    const list = await res.json();
    const searchTerm = query.toLowerCase();

    return list.filter(c => {
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      return fullName.includes(searchTerm) ||
        c.phone?.includes(query) ||
        c.ruc?.toLowerCase().includes(searchTerm);
    });
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
