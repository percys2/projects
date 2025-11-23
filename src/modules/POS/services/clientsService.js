// src/modules/POS/services/clientsService.js

// Puedes reemplazar este array por Supabase, Appwrite o tu BD real
const mockClients = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "8888-8888",
    address: "Masatepe",
    ruc: "J05050501-0",
    email: "juan@example.com",
    branch: "Masatepe",
  },
  {
    id: 2,
    name: "Distribuidora Los Aguilar",
    phone: "7777-7777",
    address: "Diriomo",
    ruc: "D07070707-1",
    email: "aguilar@example.com",
    branch: "Masatepe",
  },
  {
    id: 3,
    name: "María López",
    phone: "7555-6655",
    address: "Niquinohomo",
    ruc: null,
    email: null,
    branch: "Masatepe",
  }
];

export const clientsService = {
  async searchClients(query) {
    if (!query) return [];

    query = query.toLowerCase();

    return mockClients.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      (c.ruc && c.ruc.toLowerCase().includes(query))
    );
  },

  async getClientById(id) {
    return mockClients.find(c => c.id === id) || null;
  }
};
