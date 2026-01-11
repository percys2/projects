export const kardexService = {
  async getKardex(orgSlug, productId) {
    const res = await fetch(`/api/kardex`, {
      headers: {
        // API derives org_id from authenticated session + x-org-slug
        "x-org-slug": orgSlug,
        "x-product-id": productId
      }
    });

    if (!res.ok) throw new Error("Error cargando kardex");

    const data = await res.json();
    return data.movements || [];
  }
};
