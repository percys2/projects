import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const AccountCodes = {
  CASH: "1101",
  BANK: "1102",
  ACCOUNTS_RECEIVABLE: "1201",
  INVENTORY: "1301",
  ACCOUNTS_PAYABLE: "2101",
  SALES_INCOME: "4101",
  COST_OF_GOODS_SOLD: "5101",
  GENERAL_EXPENSE: "6101",
};

async function getOrCreateDefaultAccounts(orgId) {
  const defaultAccounts = [
    { code: "1101", name: "Caja General", type: "asset", subtype: "cash" },
    { code: "1102", name: "Banco", type: "asset", subtype: "bank" },
    { code: "1201", name: "Cuentas por Cobrar", type: "asset", subtype: "receivable" },
    { code: "1301", name: "Inventario", type: "asset", subtype: "inventory" },
    { code: "2101", name: "Cuentas por Pagar", type: "liability", subtype: "payable" },
    { code: "4101", name: "Ventas", type: "income", subtype: "sales" },
    { code: "5101", name: "Costo de Ventas", type: "expense", subtype: "cogs" },
    { code: "6101", name: "Gastos Generales", type: "expense", subtype: "general" },
  ];

  const accountMap = {};

  for (const acc of defaultAccounts) {
    const { data: existing } = await supabase
      .from("accounts")
      .select("id, code")
      .eq("org_id", orgId)
      .eq("code", acc.code)
      .single();

    if (existing) {
      accountMap[acc.code] = existing.id;
    } else {
      const { data: created } = await supabase
        .from("accounts")
        .insert({
          org_id: orgId,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          is_active: true,
        })
        .select()
        .single();

      if (created) {
        accountMap[acc.code] = created.id;
      }
    }
  }

  return accountMap;
}

async function getAccountByCode(orgId, code) {
  const { data } = await supabase
    .from("accounts")
    .select("id")
    .eq("org_id", orgId)
    .eq("code", code)
    .single();

  return data?.id;
}

export async function createJournalEntry(orgId, data) {
  const {
    date,
    description,
    source_module,
    source_id,
    lines,
  } = data;

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal entry not balanced: Debit=${totalDebit}, Credit=${totalCredit}`);
  }

  const { data: entry, error: entryError } = await supabase
    .from("journal_entries")
    .insert({
      org_id: orgId,
      date: date || new Date().toISOString().split("T")[0],
      description,
      source_module,
      source_id,
      status: "posted",
    })
    .select()
    .single();

  if (entryError) {
    console.error("Journal entry creation error:", entryError);
    throw entryError;
  }

  const entryLines = lines.map((line) => ({
    org_id: orgId,
    journal_entry_id: entry.id,
    account_id: line.account_id,
    debit: line.debit || 0,
    credit: line.credit || 0,
    description: line.description || null,
  }));

  const { error: linesError } = await supabase
    .from("journal_entry_lines")
    .insert(entryLines);

  if (linesError) {
    console.error("Journal entry lines creation error:", linesError);
    await supabase.from("journal_entries").delete().eq("id", entry.id);
    throw linesError;
  }

  return entry;
}

export async function postSaleToGL(orgId, sale, items) {
  const accounts = await getOrCreateDefaultAccounts(orgId);
  
  const totalSale = sale.total || 0;
  const totalCost = items.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0);
  const isCashSale = sale.payment_method === "efectivo" || sale.payment_method === "cash";

  const lines = [];

  if (isCashSale) {
    lines.push({
      account_id: accounts[AccountCodes.CASH],
      debit: totalSale,
      credit: 0,
      description: "Venta en efectivo",
    });
  } else {
    lines.push({
      account_id: accounts[AccountCodes.ACCOUNTS_RECEIVABLE],
      debit: totalSale,
      credit: 0,
      description: "Venta a crédito",
    });
  }

  lines.push({
    account_id: accounts[AccountCodes.SALES_INCOME],
    debit: 0,
    credit: totalSale,
    description: "Ingreso por venta",
  });

  if (totalCost > 0) {
    lines.push({
      account_id: accounts[AccountCodes.COST_OF_GOODS_SOLD],
      debit: totalCost,
      credit: 0,
      description: "Costo de mercancía vendida",
    });

    lines.push({
      account_id: accounts[AccountCodes.INVENTORY],
      debit: 0,
      credit: totalCost,
      description: "Salida de inventario",
    });
  }

  return createJournalEntry(orgId, {
    date: sale.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    description: `Venta #${sale.id}`,
    source_module: "sales",
    source_id: sale.id,
    lines,
  });
}

export async function postAPBillToGL(orgId, bill, items) {
  const accounts = await getOrCreateDefaultAccounts(orgId);
  
  const lines = [];

  for (const item of items) {
    const expenseAccountId = item.account_id || accounts[AccountCodes.GENERAL_EXPENSE];
    lines.push({
      account_id: expenseAccountId,
      debit: item.amount || 0,
      credit: 0,
      description: item.description || "Gasto",
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  lines.push({
    account_id: accounts[AccountCodes.ACCOUNTS_PAYABLE],
    debit: 0,
    credit: totalAmount,
    description: `Factura proveedor: ${bill.reference || bill.id}`,
  });

  return createJournalEntry(orgId, {
    date: bill.date,
    description: `Factura proveedor #${bill.reference || bill.id}`,
    source_module: "ap_bills",
    source_id: bill.id,
    lines,
  });
}

export async function postPaymentToGL(orgId, payment) {
  const accounts = await getOrCreateDefaultAccounts(orgId);
  
  const lines = [];
  const amount = payment.amount || 0;
  const isIncoming = payment.direction === "in";

  if (isIncoming) {
    lines.push({
      account_id: accounts[AccountCodes.CASH],
      debit: amount,
      credit: 0,
      description: "Cobro recibido",
    });

    if (payment.sale_id) {
      lines.push({
        account_id: accounts[AccountCodes.ACCOUNTS_RECEIVABLE],
        debit: 0,
        credit: amount,
        description: `Cobro de venta #${payment.sale_id}`,
      });
    } else {
      lines.push({
        account_id: accounts[AccountCodes.SALES_INCOME],
        debit: 0,
        credit: amount,
        description: "Ingreso recibido",
      });
    }
  } else {
    if (payment.bill_id) {
      lines.push({
        account_id: accounts[AccountCodes.ACCOUNTS_PAYABLE],
        debit: amount,
        credit: 0,
        description: `Pago de factura #${payment.bill_id}`,
      });
    } else {
      lines.push({
        account_id: accounts[AccountCodes.GENERAL_EXPENSE],
        debit: amount,
        credit: 0,
        description: "Pago realizado",
      });
    }

    lines.push({
      account_id: accounts[AccountCodes.CASH],
      debit: 0,
      credit: amount,
      description: "Salida de efectivo",
    });
  }

  return createJournalEntry(orgId, {
    date: payment.date,
    description: isIncoming ? `Cobro #${payment.id}` : `Pago #${payment.id}`,
    source_module: "payments",
    source_id: payment.id,
    lines,
  });
}

export async function postInventoryMovementToGL(orgId, movement) {
  const accounts = await getOrCreateDefaultAccounts(orgId);
  
  const lines = [];
  const amount = Math.abs(movement.quantity) * (movement.cost || 0);

  if (amount <= 0) return null;

  if (movement.type === "entrada" || movement.type === "entry") {
    lines.push({
      account_id: accounts[AccountCodes.INVENTORY],
      debit: amount,
      credit: 0,
      description: `Entrada de inventario: ${movement.notes || ""}`,
    });

    lines.push({
      account_id: accounts[AccountCodes.ACCOUNTS_PAYABLE],
      debit: 0,
      credit: amount,
      description: "Compra de inventario",
    });
  } else if (movement.type === "salida" || movement.type === "exit") {
    lines.push({
      account_id: accounts[AccountCodes.COST_OF_GOODS_SOLD],
      debit: amount,
      credit: 0,
      description: `Salida de inventario: ${movement.notes || ""}`,
    });

    lines.push({
      account_id: accounts[AccountCodes.INVENTORY],
      debit: 0,
      credit: amount,
      description: "Reducción de inventario",
    });
  }

  if (lines.length === 0) return null;

  return createJournalEntry(orgId, {
    date: movement.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    description: `Movimiento de inventario: ${movement.type}`,
    source_module: "inventory_movements",
    source_id: movement.id,
    lines,
  });
}
