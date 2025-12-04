export const kardexService = {
  async addMovement(orgSlug, movement) {
    const res = await fetch("/api/kardex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify(movement),
    });

    return await res.json();
  },

  async getKardex(orgSlug, productId) {
    const res = await fetch(`/api/kardex?product=${productId}`, {
      headers: { "x-org-slug": orgSlug },
    });

    return await res.json();
  }
};
