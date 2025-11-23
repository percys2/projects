"use client";

export function useKardexActions(orgId, userId) {
  async function addEntry({ productId, branchId, quantity, cost, reference }) {
    return await fetch("/api/kardex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-user-id": userId
      },
      body: JSON.stringify({
        type: "entrada",
        product_id: productId,
        branch_id: branchId,
        quantity,
        cost,
        reference
      })
    }).then(r => r.json());
  }

  async function addExit({ productId, branchId, quantity, cost, reference }) {
    return await fetch("/api/kardex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-user-id": userId
      },
      body: JSON.stringify({
        type: "salida",
        product_id: productId,
        branch_id: branchId,
        quantity,
        cost,
        reference
      })
    }).then(r => r.json());
  }

  async function adjust({ productId, branchId, quantity, cost, reference }) {
    return await fetch("/api/kardex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        "x-user-id": userId
      },
      body: JSON.stringify({
        type: "ajuste",
        product_id: productId,
        branch_id: branchId,
        quantity,
        cost,
        reference
      })
    }).then(r => r.json());
  }

  return { addEntry, addExit, adjust };
}
