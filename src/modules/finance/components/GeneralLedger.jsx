"use client";

import React, { useState, useMemo } from "react";

export default function GeneralLedger({ payments, expenses, accounts, orgName = "Mi Empresa" }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState("journal");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const journalEntries = useMemo(() => {
    const entries = [];
    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    (payments || []).forEach((payment) => {
      const paymentDate = new Date(payment.date);
      if (paymentDate < startDate || paymentDate > endDate) return;
      const entryNumber = `AST-${payment.id?.slice(0, 8) || Date.now()}`;
      
      if (payment.direction === "in") {
        entries.push({
          id: payment.id, entryNumber, date: payment.date,
          description: payment.description || "Cobro recibido",
          reference: payment.reference || "",
          lines: [
            { account: payment.cash_account_name || "Caja General", accountType: "asset", debit: payment.amount || 0, credit: 0 },
            { account: payment.category || "Ingresos por Ventas", accountType: "income", debit: 0, credit: payment.amount || 0 },
          ],
          total: payment.amount || 0, type: "income",
        });
      } else {
        entries.push({
          id: payment.id, entryNumber, date: payment.date,
          description: payment.description || "Pago realizado",
          reference: payment.reference || "",
          lines: [
            { account: payment.category || "Gastos Generales", accountType: "expense", debit: payment.amount || 0, credit: 0 },
            { account: payment.cash_account_name || "Caja General", accountType: "asset", debit: 0, credit: payment.amount || 0 },
          ],
          total: payment.amount || 0, type: "expense",
        });
      }
    });

    (expenses || []).forEach((expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate < startDate || expenseDate > endDate) return;
      const entryNumber = `FAC-${expense.id?.slice(0, 8) || Date.now()}`;
      entries.push({
        id: expense.id, entryNumber, date: expense.date,
        description: expense.description || `Factura ${expense.supplier_name || "Proveedor"}`,
        reference: expense.invoice_number || "",
        lines: [
          { account: expense.account_name || "Gastos Operativos", accountType: "expense", debit: expense.total || 0, credit: 0 },
          { account: "Cuentas por Pagar", accountType: "liability", debit: 0, credit: expense.total || 0 },
        ],
        total: expense.total || 0, type: "bill",
      });
    });

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    return entries;
  }, [payments, expenses, selectedMonth]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return journalEntries;
    const term = searchTerm.toLowerCase();
    return journalEntries.filter((entry) =>
      entry.description.toLowerCase().includes(term) ||
      entry.entryNumber.toLowerCase().includes(term) ||
      entry.reference.toLowerCase().includes(term) ||
      entry.lines.some((line) => line.account.toLowerCase().includes(term))
    );
  }, [journalEntries, searchTerm]);

  const ledgerAccounts = useMemo(() => {
    const ledger = {};
    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (!ledger[line.account]) {
          ledger[line.account] = { name: line.account, type: line.accountType, entries: [], totalDebit: 0, totalCredit: 0 };
        }
        ledger[line.account].entries.push({ date: entry.date, description: entry.description, reference: entry.entryNumber, debit: line.debit, credit: line.credit });
        ledger[line.account].totalDebit += line.debit;
        ledger[line.account].totalCredit += line.credit;
      });
    });
    Object.values(ledger).forEach((account) => {
      account.balance = (account.type === "asset" || account.type === "expense") 
        ? account.totalDebit - account.totalCredit 
        : account.totalCredit - account.totalDebit;
    });
    return ledger;
  }, [journalEntries]);

  const accountsList = useMemo(() => Object.keys(ledgerAccounts).sort(), [ledgerAccounts]);

  const totals = useMemo(() => {
    let totalDebit = 0, totalCredit = 0;
    filteredEntries.forEach((entry) => {
      entry.lines.forEach((line) => { totalDebit += line.debit; totalCredit += line.credit; });
    });
    return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }, [filteredEntries]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    let content = "";
    
    if (viewMode === "journal") {
      content = `<h2>LIBRO DIARIO</h2><p>Periodo: ${monthName}</p>
        <table><thead><tr><th>Fecha</th><th>No. Asiento</th><th>Cuenta</th><th>Descripcion</th><th>Debe</th><th>Haber</th></tr></thead>
        <tbody>${filteredEntries.map((entry) => entry.lines.map((line, idx) => `<tr><td>${idx === 0 ? entry.date : ""}</td><td>${idx === 0 ? entry.entryNumber : ""}</td><td style="padding-left:${idx > 0 ? "20px" : "0"}">${line.account}</td><td>${idx === 0 ? entry.description : ""}</td><td class="right">${line.debit > 0 ? formatCurrency(line.debit) : ""}</td><td class="right">${line.credit > 0 ? formatCurrency(line.credit) : ""}</td></tr>`).join("")).join("")}
        <tr class="total-row"><td colspan="4">TOTALES</td><td class="right">${formatCurrency(totals.totalDebit)}</td><td class="right">${formatCurrency(totals.totalCredit)}</td></tr></tbody></table>`;
    } else {
      const selectedLedger = selectedAccount ? { [selectedAccount]: ledgerAccounts[selectedAccount] } : ledgerAccounts;
      content = `<h2>LIBRO MAYOR</h2><p>Periodo: ${monthName}</p>
        ${Object.entries(selectedLedger).map(([name, account]) => `<div style="margin-bottom:30px;page-break-inside:avoid;"><h3 style="background:#f0f0f0;padding:8px;">${name}</h3>
        <table><thead><tr><th>Fecha</th><th>Descripcion</th><th>Referencia</th><th>Debe</th><th>Haber</th></tr></thead>
        <tbody>${account.entries.map((e) => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.reference}</td><td class="right">${e.debit > 0 ? formatCurrency(e.debit) : ""}</td><td class="right">${e.credit > 0 ? formatCurrency(e.credit) : ""}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="3">TOTALES</td><td class="right">${formatCurrency(account.totalDebit)}</td><td class="right">${formatCurrency(account.totalCredit)}</td></tr>
        <tr class="balance-row"><td colspan="4">SALDO</td><td class="right" style="font-weight:bold">${formatCurrency(account.balance)}</td></tr></tbody></table></div>`).join("")}`;
    }

    printWindow.document.write(`<html><head><title>${viewMode === "journal" ? "Libro Diario" : "Libro Mayor"}</title>
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; padding: 20px; font-size: 10px; }
      .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 15px; } th, td { border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px; }
      th { background: #f5f5f5; } td.right { text-align: right; } .total-row { background: #e8e8e8; font-weight: bold; } .balance-row { background: #d0e8ff; }
      @media print { @page { margin: 10mm; size: landscape; } }</style></head>
      <body><div class="header"><h1>${orgName}</h1></div>${content}<p style="text-align:center;margin-top:20px;font-size:9px;">Generado: ${new Date().toLocaleDateString("es-NI")}</p></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    let csvContent = "";
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    if (viewMode === "journal") {
      csvContent = `Libro Diario - ${orgName}\nPeriodo: ${monthName}\n\nFecha,No. Asiento,Cuenta,Descripcion,Debe,Haber\n`;
      filteredEntries.forEach((entry) => {
        entry.lines.forEach((line, idx) => {
          csvContent += `${idx === 0 ? entry.date : ""},${idx === 0 ? entry.entryNumber : ""},"${line.account}","${idx === 0 ? entry.description : ""}",${line.debit.toFixed(2)},${line.credit.toFixed(2)}\n`;
        });
      });
      csvContent += `,,,,${totals.totalDebit.toFixed(2)},${totals.totalCredit.toFixed(2)}\n`;
    } else {
      csvContent = `Libro Mayor - ${orgName}\nPeriodo: ${monthName}\n\n`;
      Object.entries(ledgerAccounts).forEach(([name, account]) => {
        csvContent += `\nCuenta: ${name}\nFecha,Descripcion,Referencia,Debe,Haber\n`;
        account.entries.forEach((e) => { csvContent += `${e.date},"${e.description}",${e.reference},${e.debit.toFixed(2)},${e.credit.toFixed(2)}\n`; });
        csvContent += `TOTALES,,,${account.totalDebit.toFixed(2)},${account.totalCredit.toFixed(2)}\nSALDO,,,,${account.balance.toFixed(2)}\n`;
      });
    }
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `libro_${viewMode === "journal" ? "diario" : "mayor"}_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Libro Diario / Mayor</h3>
          <p className="text-xs text-slate-500">Registro contable de partida doble</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="journal">Libro Diario</option>
            <option value="ledger">Libro Mayor</option>
          </select>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Exportar CSV</button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">Imprimir</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Total Asientos</p>
          <p className="text-xl font-bold text-blue-600">{journalEntries.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Total Debe</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.totalDebit)}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Total Haber</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(totals.totalCredit)}</p>
        </div>
        <div className={`${totals.isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-lg p-4`}>
          <p className="text-xs text-slate-500">Estado</p>
          <p className={`text-xl font-bold ${totals.isBalanced ? "text-green-600" : "text-red-600"}`}>{totals.isBalanced ? "Cuadrado" : "Descuadrado"}</p>
        </div>
      </div>

      {viewMode === "journal" ? (
        <div className="space-y-4">
          <input type="text" placeholder="Buscar por descripcion, cuenta o referencia..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 border-b">
              <h4 className="text-sm font-semibold text-slate-700">Libro Diario - {new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" })}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead><tr className="bg-slate-50 border-b text-xs uppercase text-slate-600"><th className="px-3 py-2 text-left w-24">Fecha</th><th className="px-3 py-2 text-left w-28">No. Asiento</th><th className="px-3 py-2 text-left">Cuenta</th><th className="px-3 py-2 text-left">Descripcion</th><th className="px-3 py-2 text-right w-28">Debe</th><th className="px-3 py-2 text-right w-28">Haber</th></tr></thead>
                <tbody>
                  {filteredEntries.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No hay asientos en este periodo</td></tr> : filteredEntries.map((entry, entryIdx) => (
                    entry.lines.map((line, lineIdx) => (
                      <tr key={`${entryIdx}-${lineIdx}`} className={`border-b ${lineIdx === 0 ? "bg-slate-50" : ""}`}>
                        <td className="px-3 py-2 text-xs">{lineIdx === 0 ? entry.date : ""}</td>
                        <td className="px-3 py-2 text-xs font-mono">{lineIdx === 0 ? entry.entryNumber : ""}</td>
                        <td className={`px-3 py-2 ${lineIdx > 0 ? "pl-8" : ""}`}>{line.account}</td>
                        <td className="px-3 py-2 text-slate-600">{lineIdx === 0 ? entry.description : ""}</td>
                        <td className="px-3 py-2 text-right font-medium text-emerald-600">{line.debit > 0 ? formatCurrency(line.debit) : ""}</td>
                        <td className="px-3 py-2 text-right font-medium text-purple-600">{line.credit > 0 ? formatCurrency(line.credit) : ""}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
                <tfoot><tr className="bg-slate-200 font-semibold"><td colSpan={4} className="px-3 py-2">TOTALES</td><td className="px-3 py-2 text-right text-emerald-700">{formatCurrency(totals.totalDebit)}</td><td className="px-3 py-2 text-right text-purple-700">{formatCurrency(totals.totalCredit)}</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Todas las cuentas</option>
            {accountsList.map((acc) => <option key={acc} value={acc}>{acc}</option>)}
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedAccount ? { [selectedAccount]: ledgerAccounts[selectedAccount] } : ledgerAccounts).map(([name, account]) => (
              <div key={name} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-700 text-white"><h4 className="font-semibold text-sm">{name}</h4><p className="text-xs text-slate-300">Tipo: {account.type}</p></div>
                <table className="min-w-full text-xs">
                  <thead><tr className="bg-slate-50 border-b"><th className="px-2 py-1 text-left">Fecha</th><th className="px-2 py-1 text-left">Descripcion</th><th className="px-2 py-1 text-right">Debe</th><th className="px-2 py-1 text-right">Haber</th></tr></thead>
                  <tbody>
                    {account.entries.map((e, idx) => (<tr key={idx} className="border-b"><td className="px-2 py-1">{e.date}</td><td className="px-2 py-1 truncate max-w-[150px]">{e.description}</td><td className="px-2 py-1 text-right text-emerald-600">{e.debit > 0 ? formatCurrency(e.debit) : ""}</td><td className="px-2 py-1 text-right text-purple-600">{e.credit > 0 ? formatCurrency(e.credit) : ""}</td></tr>))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-semibold"><td colSpan={2} className="px-2 py-1">Totales</td><td className="px-2 py-1 text-right">{formatCurrency(account.totalDebit)}</td><td className="px-2 py-1 text-right">{formatCurrency(account.totalCredit)}</td></tr>
                    <tr className={`font-bold ${account.balance >= 0 ? "bg-emerald-100" : "bg-red-100"}`}><td colSpan={3} className="px-2 py-2">SALDO</td><td className={`px-2 py-2 text-right ${account.balance >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(account.balance)}</td></tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}