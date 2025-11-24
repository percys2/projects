import React, { useState, useEffect } from "react";

export default function LaborLawConfig({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    vacation_days_per_year: 30,
    aguinaldo_months_per_year: 1,
    severance_days_per_year: 30,
    severance_max_months: 5,
    inss_employee_rate: 0.07,
    inss_employer_rate: 0.19,
    ir_exempt_amount: 100000,
  });

  useEffect(() => {
    if (settings && settings.labor_config) {
      setFormData({
        vacation_days_per_year: settings.labor_config.vacation_days_per_year || 30,
        aguinaldo_months_per_year: settings.labor_config.aguinaldo_months_per_year || 1,
        severance_days_per_year: settings.labor_config.severance_days_per_year || 30,
        severance_max_months: settings.labor_config.severance_max_months || 5,
        inss_employee_rate: settings.labor_config.inss_employee_rate || 0.07,
        inss_employer_rate: settings.labor_config.inss_employer_rate || 0.19,
        ir_exempt_amount: settings.labor_config.ir_exempt_amount || 100000,
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ labor_config: formData });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-2">Configuración de Leyes Laborales</h3>
      <p className="text-sm text-slate-600 mb-4">
        Configure los parámetros para cálculos de prestaciones, aguinaldo, vacaciones e indemnizaciones según las leyes de Nicaragua.
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Importante:</strong> Estos valores deben ser configurados por su contador o asesor legal para asegurar el cumplimiento de las leyes laborales vigentes en Nicaragua.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-medium text-sm mb-3">Vacaciones</h4>
          <div>
            <label className="block text-sm font-medium mb-1">Días de Vacaciones por Año</label>
            <input
              type="number"
              step="1"
              value={formData.vacation_days_per_year}
              onChange={(e) => handleChange("vacation_days_per_year", parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Días de vacaciones que acumula un empleado por año de servicio</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-sm mb-3">Aguinaldo (13vo Mes)</h4>
          <div>
            <label className="block text-sm font-medium mb-1">Meses de Aguinaldo por Año</label>
            <input
              type="number"
              step="0.01"
              value={formData.aguinaldo_months_per_year}
              onChange={(e) => handleChange("aguinaldo_months_per_year", parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Generalmente 1 mes de salario por año completo de servicio</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-sm mb-3">Indemnización / Severance</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Días de Indemnización por Año</label>
              <input
                type="number"
                step="1"
                value={formData.severance_days_per_year}
                onChange={(e) => handleChange("severance_days_per_year", parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Días de salario por año de servicio en caso de despido sin causa</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Máximo de Meses de Indemnización</label>
              <input
                type="number"
                step="1"
                value={formData.severance_max_months}
                onChange={(e) => handleChange("severance_max_months", parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Tope máximo de meses de indemnización</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-sm mb-3">INSS (Seguro Social)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tasa Empleado (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.inss_employee_rate * 100}
                onChange={(e) => handleChange("inss_employee_rate", parseFloat(e.target.value) / 100)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Generalmente 7%</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tasa Empleador (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.inss_employer_rate * 100}
                onChange={(e) => handleChange("inss_employer_rate", parseFloat(e.target.value) / 100)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Generalmente 19%</p>
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-sm mb-3">IR (Impuesto sobre la Renta)</h4>
          <div>
            <label className="block text-sm font-medium mb-1">Monto Exento Anual (C$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.ir_exempt_amount}
              onChange={(e) => handleChange("ir_exempt_amount", parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Monto anual exento de impuesto sobre la renta</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
          >
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
