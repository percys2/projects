export const FiscalStatus = {
  PENDING: "pending",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ERROR: "error",
};

export const DocumentTypes = {
  INVOICE: "factura",
  RECEIPT: "recibo",
  CREDIT_NOTE: "nota_credito",
  DEBIT_NOTE: "nota_debito",
};

export async function sendToTaxAuthority(document) {
  console.log("[DGI Integration Stub] Would send document to DGI:", {
    type: document.type,
    number: document.number,
    total: document.total,
    date: document.date,
  });

  return {
    success: true,
    status: FiscalStatus.PENDING,
    message: "Integración DGI pendiente de configuración",
    cae: null,
    caeExpiration: null,
  };
}

export async function validateTaxId(taxId) {
  if (!taxId) {
    return { valid: false, message: "RUC/Cédula requerido" };
  }

  const cleanTaxId = taxId.replace(/[-\s]/g, "");

  if (cleanTaxId.length === 14) {
    return { valid: true, type: "RUC", formatted: formatRUC(cleanTaxId) };
  }

  if (cleanTaxId.length === 13 || cleanTaxId.length === 16) {
    return { valid: true, type: "Cédula", formatted: cleanTaxId };
  }

  return { valid: false, message: "Formato de RUC/Cédula inválido" };
}

function formatRUC(ruc) {
  if (ruc.length !== 14) return ruc;
  return `${ruc.slice(0, 3)}-${ruc.slice(3, 9)}-${ruc.slice(9, 13)}${ruc.slice(13)}`;
}

export async function getNextInvoiceNumber(orgId, type = "invoice") {
  console.log("[DGI Integration Stub] Would get next authorized number for:", type);
  
  return {
    success: true,
    number: null,
    message: "Numeración automática DGI pendiente de configuración",
  };
}

export async function cancelDocument(documentId, reason) {
  console.log("[DGI Integration Stub] Would cancel document:", documentId, reason);
  
  return {
    success: true,
    status: FiscalStatus.PENDING,
    message: "Anulación DGI pendiente de configuración",
  };
}

export function generateInvoiceXML(invoice) {
  console.log("[DGI Integration Stub] Would generate XML for invoice:", invoice.id);
  
  return {
    success: true,
    xml: null,
    message: "Generación XML DGI pendiente de configuración",
  };
}

export function validateInvoiceForDGI(invoice) {
  const errors = [];

  if (!invoice.client_tax_id) {
    errors.push("Cliente debe tener RUC/Cédula para factura fiscal");
  }

  if (!invoice.items || invoice.items.length === 0) {
    errors.push("Factura debe tener al menos un item");
  }

  if (invoice.total <= 0) {
    errors.push("Total debe ser mayor a cero");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const DGI_CONFIG = {
  enabled: false,
  environment: "test",
  apiUrl: null,
  username: null,
  certificate: null,
  
  getMessage() {
    if (!this.enabled) {
      return "Integración DGI no configurada. Configure las credenciales en Ajustes > Facturación.";
    }
    return `Conectado a DGI (${this.environment})`;
  },
};

export function isDGIConfigured() {
  return DGI_CONFIG.enabled && DGI_CONFIG.apiUrl && DGI_CONFIG.username;
}