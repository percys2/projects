"use client";

import React from "react";

export default function PayrollModal({
  isOpen,
  onClose,
  employee,
  payroll,
  vacation,
  aguinaldo,
}) {
  if (!isOpen || !employee) return null;

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Detalle de Nómina</h2>
            <p className="text-sm text-slate-500">{employee.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Cálculo de Salario Mensual
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Salario Bruto</span>
                <span className="font-medium">{formatCurrency(payroll?.gross)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>INSS (7%)</span>
                <span>- {formatCurrency(payroll?.inss)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>IR (Impuesto sobre la Renta)</span>
                <span>- {formatCurrency(payroll?.ir)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Salario Neto</span>
                <span className="text-emerald-600">{formatCurrency(payroll?.net)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-700 mb-3">
              Vacaciones
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {vacation?.accrued || 0}
                </p>
                <p className="text-xs text-blue-500">Acumulados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">
                  {vacation?.used || 0}
                </p>
                <p className="text-xs text-slate-500">Usados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {vacation?.available || 0}
                </p>
                <p className="text-xs text-emerald-500">Disponibles</p>
              </div>
            </div>
            <p className="text-xs text-blue-500 mt-2 text-center">
              {vacation?.monthsWorked || 0} meses trabajados (2.5 días/mes)
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-700 mb-3">
              Aguinaldo (Décimo Tercer Mes)
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-600">
                  Monto estimado a recibir
                </p>
                <p className="text-xs text-amber-500">
                  Pago antes del 10 de diciembre
                </p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(aguinaldo)}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            Cálculos basados en la legislación laboral nicaragüense vigente.
            <br />
            INSS: 7% empleado | IR: según tabla progresiva DGI
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}