import React, { useState } from "react";
import { calculateLiquidacion } from "../utils/nicaraguaLaborLaw";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

export default function LiquidacionSimulator({ employee, laborConfig, onClose }) {
  const [terminationDate, setTerminationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [terminationType, setTerminationType] = useState("sin_causa");
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const liquidacion = calculateLiquidacion({
      employee,
      terminationDate,
      terminationType,
      config: laborConfig,
    });
    setResult(liquidacion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Simulador de Liquidación</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Empleado:</strong> {employee.full_name}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Salario Mensual:</strong> {formatCurrency(employee.salary)}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Fecha de Contratación:</strong> {employee.hire_date}
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de Terminación
            </label>
            <input
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Terminación
            </label>
            <select
              value={terminationType}
              onChange={(e) => setTerminationType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="sin_causa">Despido sin Causa</option>
              <option value="con_causa">Despido con Causa</option>
              <option value="renuncia">Renuncia Voluntaria</option>
            </select>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
          >
            Calcular Liquidación
          </button>
        </div>

        {result && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Información General</h3>
              <div className="bg-slate-50 p-3 rounded text-sm space-y-1">
                <p>
                  <strong>Años Trabajados:</strong> {result.employee.years_worked}
                </p>
                <p>
                  <strong>Salario Diario:</strong>{" "}
                  {formatCurrency(result.employee.daily_salary)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">Desglose de Pagos</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-slate-50 rounded text-sm">
                  <span>
                    Salarios Pendientes ({result.breakdown.pending_salary.days}{" "}
                    días)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(result.breakdown.pending_salary.amount)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-50 rounded text-sm">
                  <span>
                    Aguinaldo Proporcional ({result.breakdown.aguinaldo.months.toFixed(2)}{" "}
                    meses)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(result.breakdown.aguinaldo.amount)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-50 rounded text-sm">
                  <span>
                    Vacaciones Pendientes ({result.breakdown.vacaciones.days_pending}{" "}
                    días)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(result.breakdown.vacaciones.amount)}
                  </span>
                </div>

                {result.breakdown.indemnizacion.applicable && (
                  <div className="flex justify-between p-2 bg-green-50 rounded text-sm">
                    <span>
                      Indemnización ({result.breakdown.indemnizacion.months.toFixed(2)}{" "}
                      meses)
                    </span>
                    <span className="font-medium text-green-700">
                      {formatCurrency(result.breakdown.indemnizacion.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">Totales</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-slate-100 rounded text-sm">
                  <span className="font-medium">Total Bruto</span>
                  <span className="font-bold">
                    {formatCurrency(result.totals.total_bruto)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-red-50 rounded text-sm">
                  <span>Deducción INSS (7%)</span>
                  <span className="text-red-600">
                    -{formatCurrency(result.totals.inss_deduction)}
                  </span>
                </div>

                <div className="flex justify-between p-3 bg-blue-100 rounded">
                  <span className="font-bold">Total Neto a Pagar</span>
                  <span className="font-bold text-lg text-blue-700">
                    {formatCurrency(result.totals.total_neto)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                <strong>Nota Legal:</strong> Este cálculo es una estimación basada
                en la configuración del sistema. Debe ser validado por un contador
                o asesor legal antes de procesar el pago final.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
