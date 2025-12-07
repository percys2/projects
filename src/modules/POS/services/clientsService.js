export const clientsService = {
  async searchClients(orgSlug, query) {
    if (!query || query.length < 2) return [];

    const res = await fetch(`/api/clients`, {
      method: "GET",
      headers: { "x-org-slug": orgSlug },
    });

    const list = await res.json();
    query = query.toLowerCase();

    // Filter by first_name, last_name, or phone (clients table uses first_name/last_name, not name)
    return list.filter(c => {
      const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
      return fullName.includes(query) ||
        c.phone?.includes(query) ||
        c.first_name?.toLowerCase().includes(query) ||
        c.last_name?.toLowerCase().includes(query);
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