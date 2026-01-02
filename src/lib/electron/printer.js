/**
 * Electron Printer Integration
 * This module provides a bridge between the React app and Electron's printer functionality
 */

/**
 * Check if running inside Electron
 */
export function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
}

/**
 * Get list of available printers
 * @returns {Promise<Array>} List of printers
 */
export async function getPrinters() {
  if (!isElectron()) {
    console.warn('Not running in Electron - printer functions not available');
    return [];
  }
  
  try {
    return await window.electronAPI.getPrinters();
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
}

/**
 * Print a sales receipt
 * @param {object} sale - Sale data from the POS
 * @param {object} config - Printer configuration
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function printSaleReceipt(sale, config = {}) {
  if (!isElectron()) {
    console.warn('Not running in Electron - using browser print');
    window.print();
    return { success: true, fallback: 'browser' };
  }

  const printerName = config.printerName || 'usb:';
  
  // Transform sale data to receipt format
  const receiptData = {
    header: {
      businessName: config.businessName || 'AgroCentro ERP',
      address: config.address || '',
      phone: config.phone || '',
      ruc: config.ruc || ''
    },
    receipt: {
      number: sale.invoice_number || sale.id?.substring(0, 8) || '-',
      date: sale.fecha || new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer: sale.customer?.name || sale.customer_name || 'Cliente General'
    },
    items: (sale.sales_items || sale.items || []).map(item => ({
      name: item.product?.name || item.name || 'Producto',
      quantity: item.quantity || 1,
      price: item.price || item.unit_price || 0
    })),
    totals: {
      subtotal: sale.subtotal || sale.total || 0,
      tax: sale.tax || 0,
      discount: sale.discount || 0,
      total: sale.total || 0
    },
    payment: {
      method: sale.payment_method || 'Efectivo',
      received: sale.amount_received || sale.total,
      change: sale.change || 0
    },
    footer: config.footer || 'Gracias por su compra!'
  };

  try {
    return await window.electronAPI.printReceipt(printerName, receiptData);
  } catch (error) {
    console.error('Error printing receipt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Print a custom receipt with raw data
 * @param {object} data - Receipt data
 * @param {string} printerName - Printer name/connection string
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function printReceipt(data, printerName = 'usb:') {
  if (!isElectron()) {
    console.warn('Not running in Electron - printer functions not available');
    return { success: false, error: 'Not running in Electron' };
  }

  try {
    return await window.electronAPI.printReceipt(printerName, data);
  } catch (error) {
    console.error('Error printing receipt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get app version (only works in Electron)
 */
export async function getAppVersion() {
  if (!isElectron()) return null;
  
  try {
    return await window.electronAPI.getAppVersion();
  } catch (error) {
    return null;
  }
}

/**
 * Check for updates (only works in Electron)
 */
export function onUpdateAvailable(callback) {
  if (!isElectron()) return;
  window.electronAPI.onUpdateAvailable(callback);
}

export function onUpdateDownloaded(callback) {
  if (!isElectron()) return;
  window.electronAPI.onUpdateDownloaded(callback);
}

export function installUpdate() {
  if (!isElectron()) return;
  window.electronAPI.installUpdate();
}