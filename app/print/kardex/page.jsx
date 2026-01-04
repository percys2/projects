"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PrintKardexContent() {
  const searchParams = useSearchParams();
  const [printData, setPrintData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const batchId = searchParams.get("batchId");
  const consecutivo = searchParams.get("consecutivo");
  const orgSlug = searchParams.get("org");

  useEffect(() => {
    async function loadData() {
      const storedData = localStorage.getItem("kardex_print_data");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setPrintData(parsed);
          setLoading(false);
          localStorage.removeItem("kardex_print_data");
          return;
        } catch (e) {
          console.error("Error parsing stored print data:", e);
        }
      }

      if (!orgSlug || (!batchId && !consecutivo)) {
        setError("Faltan parametros (org, batchId o consecutivo)");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (batchId) params.append("batchId", batchId);
        if (consecutivo) params.append("consecutivo", consecutivo);

        const res = await fetch(`/api/inventory/movements/batch?${params.toString()}`, {
          headers: { "x-org-slug": orgSlug },
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error cargando datos");

        setPrintData(data.printData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    loadData();
  }, [batchId, consecutivo, orgSlug]);

  useEffect(() => {
    if (printData && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [printData, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!printData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No hay datos para imprimir</p>
      </div>
    );
  }

  const getTypeLabel = (type) => {
    const labels = {
      entrada: "ORDEN DE ENTRADA",
      salida: "ORDEN DE SALIDA",
      transferencia: "ORDEN DE TRANSFERENCIA",
      ajuste: "ORDEN DE AJUSTE",
      venta: "FACTURA DE VENTA",
    };
    return labels[type] || type?.toUpperCase();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 10px;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          body {
            background: #f0f0f0;
          }
        }
      `}</style>

      <div className="print-container max-w-[80mm] mx-auto bg-white p-2 font-mono text-[10px] leading-tight">
        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          <h1 className="font-bold text-sm uppercase">{printData.org?.name || "MI EMPRESA"}</h1>
          {printData.org?.ruc && <p>RUC: {printData.org.ruc}</p>}
          {printData.org?.address && <p>{printData.org.address}</p>}
          {printData.org?.phone && <p>Tel: {printData.org.phone}</p>}
        </div>

        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          <h2 className="font-bold text-xs">{getTypeLabel(printData.type)}</h2>
          <p className="text-lg font-bold">{printData.consecutivo}</p>
        </div>

        <div className="border-b border-dashed border-gray-400 pb-2 mb-2 space-y-1">
          {printData.providerInvoice && (
            <div className="flex justify-between">
              <span>Fact Proveedor:</span>
              <span className="font-semibold">{printData.providerInvoice}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Ingresa a:</span>
            <span className="font-semibold">{printData.branchName || "BODEGA"}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span className="font-semibold">{printData.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Usuario:</span>
            <span className="font-semibold">{printData.userName}</span>
          </div>
          {printData.providerName && (
            <div className="flex justify-between">
              <span>Proveedor:</span>
              <span className="font-semibold">{printData.providerName}</span>
            </div>
          )}
        </div>

        <div className="border-b border-gray-400 pb-1 mb-1">
          <div className="flex font-bold">
            <span className="w-12">CANT</span>
            <span className="flex-1">UM</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          {printData.items?.map((item, index) => (
            <div key={item.id || index} className="mb-2">
              <p className="font-semibold uppercase">{item.productName}</p>
              <div className="flex">
                <span className="w-12">{item.qty}</span>
                <span className="flex-1">{item.unit || "UND"}</span>
              </div>
            </div>
          ))}
        </div>

        {printData.notes && (
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
            <p className="text-[9px]">Nota: {printData.notes}</p>
          </div>
        )}

        <div className="text-center pt-2">
          <p>{printData.date} {printData.time}</p>
          <p className="mt-2 font-bold">Fin</p>
        </div>

        <div className="no-print mt-4 flex gap-2 justify-center">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Imprimir
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

export default function PrintKardexPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Cargando...</p></div>}>
      <PrintKardexContent />
    </Suspense>
  );
}