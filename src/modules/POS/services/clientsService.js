// Helper para obtener el nombre de display del cliente
function getClientDisplayName(c) {
  // Prioridad: nombre completo > nombre > business_name > telefono > id
  if (c.first_name || c.last_name) {
    return `${c.first_name || ''} ${c.last_name || ''}`.trim();
  }
  if (c.name && typeof c.name === 'string' && !c.name.match(/^[0-9-]+$/)) {
    return c.name;
  }
  if (c.business_name) return c.business_name;
  if (c.nombre) return c.nombre;
  if (c.razon_social) return c.razon_social;
  if (c.phone) return `Cliente ${c.phone}`;
  return `Cliente #${String(c.id).slice(0, 8)}`;
}

export const clientsService = {
  async searchClients(orgSlug, query = "") {
    if (!orgSlug) return [];

    const res = await fetch(`/api/clients`, {
      method: "GET",
      headers: { "x-org-slug": orgSlug },
    });

    if (!res.ok) return [];

    const list = await res.json();
    
    // Normalize clients to always have display_name and name
    const normalized = (Array.isArray(list) ? list : []).map(c => ({
      ...c,
      display_name: getClientDisplayName(c),
      name: getClientDisplayName(c),
    }));

    // If no query, return first 50 clients
    if (!query || query.length < 2) {
      return normalized.slice(0, 50);
    }

    // Filter by name, phone, or ruc
    const q = query.toLowerCase();
    return normalized.filter(c => 
      c.display_name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.ruc?.toLowerCase().includes(q)
    );
  },

  async getClientById(orgSlug, id) {
    const res = await fetch(`/api/clients/${id}`, {
      headers: { "x-org-slug": orgSlug },
    });

    if (!res.ok) return null;

    const client = await res.json();
    return {
      ...client,
      display_name: getClientDisplayName(client),
      name: getClientDisplayName(client),
    };
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

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error creando cliente");
    }

    const client = await res.json();
    return {
      ...client,
      display_name: getClientDisplayName(client),
      name: getClientDisplayName(client),
    };
  },
};