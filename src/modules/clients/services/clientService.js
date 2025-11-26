export const clientsService = {
  async getAll() {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("clients");
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  async create(client) {
    const existing = await this.getAll();
    const updated = [...existing, client];
    localStorage.setItem("clients", JSON.stringify(updated));
    return client;
  },

  async update(client) {
    const existing = await this.getAll();
    const updated = existing.map((c) =>
      c.id === client.id ? client : c
    );
    localStorage.setItem("clients", JSON.stringify(updated));
    return client;
  },

  async remove(id) {
    const existing = await this.getAll();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem("clients", JSON.stringify(updated));
  },
};
