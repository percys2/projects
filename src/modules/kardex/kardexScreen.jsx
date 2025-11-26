"use client";

import React, { useEffect, useState } from "react";
import KardexTable from "./kardexTable";
import { exportKardexPDF } from "./utils/exportKardexPDF";
import { exportKardexExcel } from "./utils/exportKardexExcel";

export default function KardexScreen({ orgId, products = [], branches = [] }) {
  // -----------------------------
  // Estados
  // -----------------------------
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [movementType, setMovementType] = useState("all");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [page, setPage] = useState(0);
  const limit = 50;

  const [error, setError] = useState(null);

  // -----------------------------
  // CARGAR KARDEX
  // -----------------------------
  async function loadKardex() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit,
        offset: page * limit,
      });

      if (dateStart) params.append("startDate", dateStart);
      if (dateEnd) params.append("endDate", dateEnd);

      const res = await fetch(`/api/kardex?${params.toString()}`, {
        headers: {
          "x-org-id": orgId,
          "x-product-id": selectedProduct,
          "x-branch-id": selectedBranch,
          "x-movement-type": movementType,
        },
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Error loading Kardex");

      setMovements(json.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Ejecutar load cuando cambien filtros o páginas
  useEffect(() => {
    loadKardex();
  }, [selectedProduct, selectedBranch, movementType, dateStart, dateEnd, page]);

  // -----------------------------
  // PDF
  // -----------------------------
  function handlePrint() {
    const org = {
      name: "AgroCentro Nica",
      ruc: "401-010200-1002D",
      address: "Masatepe, Nicaragua",
      phone: "8888-8888",
    };

    exportKardexPDF({
      org,
      product:
        selectedProduct !== "all"
          ? products.find((p) => p.id === selectedProduct)
          : null,
      branch:
        selectedBranch !== "all"
          ? branches.find((b) => b.id === selectedBranch)
          : null,
      movements,
      dateStart,
      dateEnd,
      userName: "Administrador",
    });
  }

  // -----------------------------
  // EXCEL
  // -----------------------------
  function handleExportExcel() {
    const org = {
      name: "AgroCentro Nica",
      ruc: "401-010200-1002D",
    };

    exportKardexExcel({
      org,
      product:
        selectedProduct !== "all"
          ? products.find((p) => p.id === selectedProduct)
          : null,
      branch:
        selectedBranch !== "all"
          ? branches.find((b) => b.id === selectedBranch)
          : null,
      movements,
      dateStart,
      dateEnd,
    });
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-6">
      {/* -------------------------- */}
      {/* FILTROS                   */}
      {/* -------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border rounded-xl shadow-sm">

        {/* PRODUCTO */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Producto</label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setPage(0);
              setSelectedProduct(e.target.value);
            }}
            className="w-full p-2 text-xs border rounded-lg"
          >
            <option value="all">Todos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* SUCURSAL */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Sucursal</label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setPage(0);
              setSelectedBranch(e.target.value);
            }}
            className="w-full p-2 text-xs border rounded-lg"
          >
            <option value="all">Todas</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* TIPO DE MOVIMIENTO */}
        <div>
          <label className="text-xs font-semibold text-slate-600">
            Movimiento
          </label>
          <select
            value={movementType}
            onChange={(e) => {
              setPage(0);
              setMovementType(e.target.value);
            }}
            className="w-full p-2 text-xs border rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="transferencia">Transferencias</option>
            <option value="venta">Ventas</option>
            <option value="ajuste">Ajustes</option>
          </select>
        </div>

        {/* FECHAS */}
        <div>
          <label className="text-xs font-semibold text-slate-600">Desde</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => {
              setPage(0);
              setDateStart(e.target.value);
            }}
            className="w-full p-2 text-xs border rounded-lg"
          />

          <label className="text-xs font-semibold text-slate-600 mt-2 block">
            Hasta
          </label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => {
              setPage(0);
              setDateEnd(e.target.value);
            }}
            className="w-full p-2 text-xs border rounded-lg"
          />
        </div>
      </div>

      {/* ESTADOS */}
      {loading && (
        <p className="text-center text-slate-500 text-sm">Cargando...</p>
      )}

      {error && (
        <p className="text-center text-red-600 text-sm">{error}</p>
      )}

      {/* TABLA */}
      {!loading && (
        <KardexTable
          data={movements}
          page={page}
          setPage={setPage}
          limit={limit}
          org={{}}
          product={
            selectedProduct !== "all"
              ? products.find((p) => p.id === selectedProduct)
              : null
          }
          branch={
            selectedBranch !== "all"
              ? branches.find((b) => b.id === selectedBranch)
              : null
          }
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />
      )}
    </div>
  );
}
