export const kardexService = {
  async getKardex(orgSlug, productId) {
    const res = await fetch(`/api/kardex`, {
      headers: {
        "x-org-id": orgSlug,          // ⚠ en tu ERP orgSlug == orgId
        "x-product-id": productId
      }
    });

    if (!res.ok) throw new Error("Error cargando kardex");

    const data = await res.json();
    return data.movements || [];
  }
};
