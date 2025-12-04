export const clientsService = {
  async searchClients(orgSlug, query) {
    if (!query || query.length < 2) return [];

    const res = await fetch(`/api/clients`, {
      method: "GET",
      headers: { "x-org-slug": orgSlug },
    });

    const list = await res.json();
    query = query.toLowerCase();

    return list.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone?.includes(query) ||
      c.ruc?.toLowerCase().includes(query)
    );
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
