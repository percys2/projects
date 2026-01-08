const getOrgSlug = () => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  const match = path.match(/^\/([^/]+)/);
  return match ? match[1] : null;
};

export const clientsService = {
  async getAll() {
    const orgSlug = getOrgSlug();
    if (!orgSlug) return [];
    
    try {
      const res = await fetch("/api/clients", {
        headers: { "x-org-slug": orgSlug },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  },

  async create(client) {
    const orgSlug = getOrgSlug();
    if (!orgSlug) throw new Error("No org slug");
    
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify(client),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error creating client");
    }
    return await res.json();
  },

  async update(client) {
    const orgSlug = getOrgSlug();
    if (!orgSlug) throw new Error("No org slug");
    
    const res = await fetch("/api/clients", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify(client),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error updating client");
    }
    return await res.json();
  },

  async remove(id) {
    const orgSlug = getOrgSlug();
    if (!orgSlug) throw new Error("No org slug");
    
    const res = await fetch("/api/clients", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify({ id }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Error deleting client");
    }
  },
};
