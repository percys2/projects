"use client";

import React, { useState, useMemo } from "react";

const TAX_CONFIG = {
  IVA_RATE: 0.15,
  IR_RATES: [
    { min: 0, max: 100000, rate: 0, fixed: 0 },
    { min: 100000.01, max: 200000, rate: 0.15, fixed: 0 },
    { min: 200000.01, max: 350000, rate: 0.20, fixed: 15000 },
    { min: 350000.01, max: 500000, rate: 0.25, fixed: 45000 },
    { min: 500000.01, max: Infinity, rate: 0.30, fixed: 82500 },
  ],
  RETENTION_RATES: {
    services: 0.10,
    purchases: 0.02,
    rent: 0.10,
    professional: 0.10,
  },
  IMI_RATE: 0.01,
};

export default function TaxReports({ 
  payments, 
  expenses, 
  employees,
  sales = [],
  orgName = "Mi Empresa",
  ruc = "" 
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState("iva");

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMonthRange = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return { startDate, endDate };
  };

  const ivaData = useMemo(() => {
    const { startDate, endDate } = getMonthRange(selectedMonth);
    const useSalesData = sales && sales.length > 0;
    
    let salesItems = [];
    let totalSalesAmount = 0;
    
    if (useSalesData) {
      salesItems = (sales || []).filter((s) => {
        if (s.status === "canceled" || s.status === "refunded") return false;
        const date = new Date(s.fecha);
        return date >= startDate && date <= endDate;
      });
      totalSalesAmount = salesItems.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    } else {
      salesItems = (payments || []).filter((p) => {
        if (p.direction !== "in") return false;
        const date = new Date(p.date);
        return date >= startDate && date <= endDate;
      });
      totalSalesAmount = salesItems.reduce((sum, s) => sum + (s.amount || 0), 0);
    }
    
    const baseImponibleVentas = totalSalesAmount / (1 + TAX_CONFIG.IVA_RATE);
    const ivaDebitoFiscal = baseImponibleVentas * TAX_CONFIG.IVA_RATE;
    
    const purchases = (expenses || []).filter((e) => {
      const date = new Date(e.date);
      return date >= startDate && date <= endDate;
    });
    
    const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const baseImponibleCompras = totalPurchases / (1 + TAX_CONFIG.IVA_RATE);
    const ivaCreditoFiscal = baseImponibleCompras * TAX_CONFIG.IVA_RATE;
    
    const ivaAPagar = Math.max(0, ivaDebitoFiscal - ivaCreditoFiscal);
    const ivaSaldoFavor = Math.max(0, ivaCreditoFiscal - ivaDebitoFiscal);
    
    return {
      sales: { count: salesItems.length, subtotal: baseImponibleVentas, iva: ivaDebitoFiscal, total: totalSalesAmount, items: salesItems },
      purchases: { count: purchases.length, subtotal: baseImponibleCompras, iva: ivaCreditoFiscal, total: totalPurchases, items: purchases },
      ivaDebitoFiscal, ivaCreditoFiscal, ivaAPagar, ivaSaldoFavor, usingSalesData: useSalesData,
    };
  }, [payments, expenses, sales, selectedMonth]);

  const retentionsData = useMemo(() => {
    const { startDate, endDate } = getMonthRange(selectedMonth);
    const expensesWithRetention = (expenses || []).filter((e) => {
      const date = new Date(e.date);
      return date >= startDate && date <= endDate;
    }).map((e) => {
      const retentionType = e.retention_type || "purchases";
      const rate = TAX_CONFIG.RETENTION_RATES[retentionType] || 0.02;
      const retentionAmount = (e.total || 0) * rate;
      return { ...e, retentionType, retentionRate: rate, retentionAmount };
    });
    
    const byType = {
      services: { items: [], total: 0, retention: 0 },
      purchases: { items: [], total: 0, retention: 0 },
      rent: { items: [], total: 0, retention: 0 },
      professional: { items: [], total: 0, retention: 0 },
    };
    
    expensesWithRetention.forEach((e) => {
      const type = e.retentionType;
      if (byType[type]) {
        byType[type].items.push(e);
        byType[type].total += e.total || 0;
        byType[type].retention += e.retentionAmount;
      }
    });
    
    const totalRetentions = Object.values(byType).reduce((sum, t) => sum + t.retention, 0);
    return { byType, totalRetentions, items: expensesWithRetention };
  }, [expenses, selectedMonth]);

  const payrollIRData = useMemo(() => {
    const activeEmployees = (employees || []).filter((e) => e.status === "activo");
    const employeeData = activeEmployees.map((emp) => {
      const monthlySalary = emp.salary || 0;
      const annualSalary = monthlySalary * 12;
      let irAnnual = 0;
      for (const bracket of TAX_CONFIG.IR_RATES) {
        if (annualSalary > bracket.min) {
          if (annualSalary <= bracket.max) {
            irAnnual = bracket.fixed + (annualSalary - bracket.min) * bracket.rate;
            break;
          }
        }
      }
      const irMonthly = irAnnual / 12;
      const inssEmployee = monthlySalary * 0.07;
      return { ...emp, monthlySalary, inssEmployee, irMonthly, netSalary: monthlySalary - inssEmployee - irMonthly };
    });
    const totals = employeeData.reduce((acc, emp) => ({
      salary: acc.salary + emp.monthlySalary,
      inss: acc.inss + emp.inssEmployee,
      ir: acc.ir + emp.irMonthly,
      net: acc.net + emp.netSalary,
    }), { salary: 0, inss: 0, ir: 0, net: 0 });
    return { employees: employeeData, totals };
  }, [employees, selectedMonth]);

  const imiData = useMemo(() => {
    const { startDate, endDate } = getMonthRange(selectedMonth);
    const salesFiltered = (payments || []).filter((p) => {
      if (p.direction !== "in") return false;
      const date = new Date(p.date);
      return date >= startDate && date <= endDate;
    });
    const totalIncome = salesFiltered.reduce((sum, s) => sum + (s.amount || 0), 0);
    const imiAmount = totalIncome * TAX_CONFIG.IMI_RATE;
    return { totalIncome, imiRate: TAX_CONFIG.IMI_RATE, imiAmount };
  }, [payments, selectedMonth]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    let content = "";
    let title = "";
    
    if (reportType === "iva") {
      title = "Declaracion Mensual de IVA";
      content = `<table>
        <tr class="section-header"><td colspan="2">VENTAS (IVA DEBITO FISCAL)</td></tr>
        <tr><td>Ventas Gravadas</td><td class="right">${formatCurrency(ivaData.sales.subtotal)}</td></tr>
        <tr><td>IVA 15%</td><td class="right">${formatCurrency(ivaData.ivaDebitoFiscal)}</td></tr>
        <tr class="total-row"><td>Total Ventas</td><td class="right">${formatCurrency(ivaData.sales.total)}</td></tr>
        <tr class="section-header"><td colspan="2">COMPRAS (IVA CREDITO FISCAL)</td></tr>
        <tr><td>Compras Gravadas</td><td class="right">${formatCurrency(ivaData.purchases.subtotal)}</td></tr>
        <tr><td>IVA 15%</td><td class="right">${formatCurrency(ivaData.ivaCreditoFiscal)}</td></tr>
        <tr class="total-row"><td>Total Compras</td><td class="right">${formatCurrency(ivaData.purchases.total)}</td></tr>
        <tr class="section-header"><td colspan="2">LIQUIDACION</td></tr>
        ${ivaData.ivaAPagar > 0 ? `<tr class="grand-total"><td>IVA A PAGAR</td><td class="right">${formatCurrency(ivaData.ivaAPagar)}</td></tr>` : `<tr class="credit-row"><td>SALDO A FAVOR</td><td class="right">${formatCurrency(ivaData.ivaSaldoFavor)}</td></tr>`}
      </table>`;
    }

    printWindow.document.write(`<html><head><title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        td.right { text-align: right; }
        .section-header { background: #e8e8e8; font-weight: bold; }
        .total-row { background: #f0f0f0; font-weight: bold; }
        .grand-total { background: #333; color: white; font-weight: bold; }
        .credit-row { background: #d4edda; font-weight: bold; color: #155724; }
      </style>
    </head><body>
      <div class="header"><h1>${orgName}</h1><h2>${title}</h2><p>Periodo: ${monthName}</p></div>
      ${content}
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    let csvContent = "";
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    if (reportType === "iva") {
      csvContent = `Declaracion IVA - ${orgName}\nPeriodo: ${monthName}\n\nVENTAS\nVentas Gravadas,${ivaData.sales.subtotal.toFixed(2)}\nIVA Debito,${ivaData.ivaDebitoFiscal.toFixed(2)}\nTotal,${ivaData.sales.total.toFixed(2)}\n\nCOMPRAS\nCompras Gravadas,${ivaData.purchases.subtotal.toFixed(2)}\nIVA Credito,${ivaData.ivaCreditoFiscal.toFixed(2)}\nTotal,${ivaData.purchases.total.toFixed(2)}\n\nIVA a Pagar,${ivaData.ivaAPagar.toFixed(2)}\nSaldo a Favor,${ivaData.ivaSaldoFavor.toFixed(2)}`;
    }
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `declaracion_${reportType}_${selectedMonth}.csv`;
    link.click();
  };

  const reportLabels = { iva: "Declaracion IVA", retentions: "Retenciones en la Fuente", ir: "IR sobre Salarios", imi: "Impuesto Municipal (IMI)" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Declaraciones Fiscales</h3>
          <p className="text-xs text-slate-500">Reportes para DGI y Alcaldia</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="iva">IVA Mensual</option>
            <option value="retentions">Retenciones IR</option>
            <option value="ir">IR sobre Salarios</option>
            <option value="imi">IMI Municipal</option>
          </select>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Exportar CSV</button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">Imprimir</button>
        </div>
      </div>

      <div className="bg-slate-100 rounded-lg p-4 text-center">
        <h4 className="text-lg font-bold text-slate-700">{reportLabels[reportType]}</h4>
        <p className="text-sm text-slate-500">Periodo: {new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" })}</p>
      </div>

      {reportType === "iva" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-emerald-600 text-white"><h4 className="font-semibold">VENTAS (IVA Debito Fiscal)</h4></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-600">Facturas:</span><span className="font-medium">{ivaData.sales.count}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Ventas Gravadas:</span><span className="font-medium">{formatCurrency(ivaData.sales.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">IVA 15%:</span><span className="font-medium text-emerald-600">{formatCurrency(ivaData.ivaDebitoFiscal)}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total:</span><span className="font-bold text-emerald-600">{formatCurrency(ivaData.sales.total)}</span></div>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-red-600 text-white"><h4 className="font-semibold">COMPRAS (IVA Credito Fiscal)</h4></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-600">Facturas:</span><span className="font-medium">{ivaData.purchases.count}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Compras Gravadas:</span><span className="font-medium">{formatCurrency(ivaData.purchases.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">IVA 15%:</span><span className="font-medium text-red-600">{formatCurrency(ivaData.ivaCreditoFiscal)}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total:</span><span className="font-bold text-red-600">{formatCurrency(ivaData.purchases.total)}</span></div>
              </div>
            </div>
          </div>
          <div className={`border rounded-lg p-4 ${ivaData.ivaAPagar > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
            <h4 className="font-semibold text-slate-700 mb-3">LIQUIDACION DEL IVA</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span>IVA Debito Fiscal:</span><span className="font-medium">{formatCurrency(ivaData.ivaDebitoFiscal)}</span></div>
              <div className="flex justify-between"><span>(-) IVA Credito Fiscal:</span><span className="font-medium">({formatCurrency(ivaData.ivaCreditoFiscal)})</span></div>
              <div className="flex justify-between border-t pt-2 text-lg">
                {ivaData.ivaAPagar > 0 ? (<><span className="font-bold text-orange-700">IVA A PAGAR:</span><span className="font-bold text-orange-700">{formatCurrency(ivaData.ivaAPagar)}</span></>) : (<><span className="font-bold text-green-700">SALDO A FAVOR:</span><span className="font-bold text-green-700">{formatCurrency(ivaData.ivaSaldoFavor)}</span></>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === "retentions" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-slate-100 border-b text-xs uppercase text-slate-600"><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-right">Base</th><th className="px-4 py-3 text-right">Tasa</th><th className="px-4 py-3 text-right">Retencion</th></tr></thead>
            <tbody>
              <tr className="border-b hover:bg-slate-50"><td className="px-4 py-3">Compras</td><td className="px-4 py-3 text-right">{formatCurrency(retentionsData.byType.purchases.total)}</td><td className="px-4 py-3 text-right">2%</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(retentionsData.byType.purchases.retention)}</td></tr>
              <tr className="border-b hover:bg-slate-50"><td className="px-4 py-3">Servicios Profesionales</td><td className="px-4 py-3 text-right">{formatCurrency(retentionsData.byType.professional.total)}</td><td className="px-4 py-3 text-right">10%</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(retentionsData.byType.professional.retention)}</td></tr>
              <tr className="border-b hover:bg-slate-50"><td className="px-4 py-3">Servicios Generales</td><td className="px-4 py-3 text-right">{formatCurrency(retentionsData.byType.services.total)}</td><td className="px-4 py-3 text-right">10%</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(retentionsData.byType.services.retention)}</td></tr>
              <tr className="border-b hover:bg-slate-50"><td className="px-4 py-3">Alquileres</td><td className="px-4 py-3 text-right">{formatCurrency(retentionsData.byType.rent.total)}</td><td className="px-4 py-3 text-right">10%</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(retentionsData.byType.rent.retention)}</td></tr>
            </tbody>
            <tfoot><tr className="bg-slate-800 text-white font-semibold"><td colSpan={3} className="px-4 py-3">TOTAL RETENCIONES</td><td className="px-4 py-3 text-right">{formatCurrency(retentionsData.totalRetentions)}</td></tr></tfoot>
          </table>
        </div>
      )}

      {reportType === "ir" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-slate-100 border-b text-xs uppercase text-slate-600"><th className="px-4 py-3 text-left">Empleado</th><th className="px-4 py-3 text-right">Salario</th><th className="px-4 py-3 text-right">INSS 7%</th><th className="px-4 py-3 text-right">IR</th><th className="px-4 py-3 text-right">Neto</th></tr></thead>
            <tbody>
              {payrollIRData.employees.length === 0 ? (<tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No hay empleados activos</td></tr>) : (
                payrollIRData.employees.map((emp, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(emp.monthlySalary)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(emp.inssEmployee)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(emp.irMonthly)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatCurrency(emp.netSalary)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot><tr className="bg-slate-800 text-white font-semibold"><td className="px-4 py-3">TOTALES</td><td className="px-4 py-3 text-right">{formatCurrency(payrollIRData.totals.salary)}</td><td className="px-4 py-3 text-right">{formatCurrency(payrollIRData.totals.inss)}</td><td className="px-4 py-3 text-right">{formatCurrency(payrollIRData.totals.ir)}</td><td className="px-4 py-3 text-right">{formatCurrency(payrollIRData.totals.net)}</td></tr></tfoot>
          </table>
        </div>
      )}

      {reportType === "imi" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-purple-600 text-white"><h4 className="font-semibold">Impuesto Municipal sobre Ingresos (IMI)</h4></div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b"><span className="text-slate-600">Ingresos Brutos:</span><span className="text-xl font-bold">{formatCurrency(imiData.totalIncome)}</span></div>
            <div className="flex justify-between items-center py-3 border-b"><span className="text-slate-600">Tasa IMI:</span><span className="text-xl font-bold">1%</span></div>
            <div className="flex justify-between items-center py-3 bg-purple-50 rounded-lg px-4"><span className="text-lg font-semibold text-purple-700">IMI A PAGAR:</span><span className="text-2xl font-bold text-purple-700">{formatCurrency(imiData.imiAmount)}</span></div>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Calendario de Obligaciones Fiscales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white rounded-lg p-3 border"><p className="font-medium text-slate-700">IVA Mensual</p><p className="text-slate-500">Dia 15 del mes siguiente</p></div>
          <div className="bg-white rounded-lg p-3 border"><p className="font-medium text-slate-700">Retenciones IR</p><p className="text-slate-500">Primeros 5 dias habiles</p></div>
          <div className="bg-white rounded-lg p-3 border"><p className="font-medium text-slate-700">INSS</p><p className="text-slate-500">Dia 17 del mes siguiente</p></div>
          <div className="bg-white rounded-lg p-3 border"><p className="font-medium text-slate-700">IMI Municipal</p><p className="text-slate-500">Ultimos 15 dias del mes</p></div>
        </div>
      </div>
    </div>
  );
}