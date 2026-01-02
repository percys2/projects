/**
 * Thermal Printer Module for AgroCentro ERP
 * Supports ESC/POS printers via USB and Network
 */

let escpos;
let USB;
let Network;

// Try to load escpos modules (they may not be installed yet)
try {
  escpos = require('escpos');
  USB = require('escpos-usb');
  Network = require('escpos-network');
  escpos.USB = USB;
  escpos.Network = Network;
} catch (error) {
  console.warn('ESC/POS modules not loaded:', error.message);
}

/**
 * Get list of available USB printers
 */
async function getUSBPrinters() {
  if (!USB) return [];
  
  try {
    const devices = USB.findPrinter();
    return devices.map(device => ({
      type: 'usb',
      name: `USB Printer (${device.deviceDescriptor?.idVendor}:${device.deviceDescriptor?.idProduct})`,
      vendorId: device.deviceDescriptor?.idVendor,
      productId: device.deviceDescriptor?.idProduct
    }));
  } catch (error) {
    console.error('Error finding USB printers:', error);
    return [];
  }
}

/**
 * Print a receipt to a thermal printer
 * @param {string} printerName - Name or connection string of the printer
 * @param {object} data - Receipt data to print
 */
async function printReceipt(printerName, data) {
  if (!escpos) {
    return { success: false, error: 'ESC/POS modules not installed. Run: npm install escpos escpos-usb escpos-network' };
  }

  return new Promise((resolve) => {
    try {
      let device;
      
      // Determine printer type based on name/config
      if (printerName.startsWith('network:')) {
        // Network printer: "network:192.168.1.100:9100"
        const [, ip, port] = printerName.split(':');
        device = new escpos.Network(ip, parseInt(port) || 9100);
      } else if (printerName.startsWith('usb:')) {
        // USB printer: "usb:vendorId:productId"
        const [, vendorId, productId] = printerName.split(':');
        device = new escpos.USB(parseInt(vendorId), parseInt(productId));
      } else {
        // Default to first USB printer
        device = new escpos.USB();
      }

      const printer = new escpos.Printer(device);

      device.open((error) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }

        try {
          // Start printing
          printer
            .font('a')
            .align('ct')
            .style('b')
            .size(1, 1);

          // Print header
          if (data.header) {
            printer.text(data.header.businessName || 'AgroCentro ERP');
            printer.style('normal');
            if (data.header.address) printer.text(data.header.address);
            if (data.header.phone) printer.text(`Tel: ${data.header.phone}`);
            if (data.header.ruc) printer.text(`RUC: ${data.header.ruc}`);
          }

          printer.text('--------------------------------');

          // Print receipt info
          if (data.receipt) {
            printer.align('lt');
            printer.text(`Factura: ${data.receipt.number || '-'}`);
            printer.text(`Fecha: ${data.receipt.date || new Date().toLocaleDateString()}`);
            printer.text(`Hora: ${data.receipt.time || new Date().toLocaleTimeString()}`);
            if (data.receipt.customer) {
              printer.text(`Cliente: ${data.receipt.customer}`);
            }
          }

          printer.text('--------------------------------');

          // Print items
          if (data.items && data.items.length > 0) {
            printer.align('lt');
            
            data.items.forEach(item => {
              const qty = item.quantity || 1;
              const price = parseFloat(item.price) || 0;
              const total = qty * price;
              
              printer.text(item.name || 'Producto');
              printer.text(`  ${qty} x C$${price.toFixed(2)} = C$${total.toFixed(2)}`);
            });
          }

          printer.text('--------------------------------');

          // Print totals
          if (data.totals) {
            printer.align('rt');
            
            if (data.totals.subtotal !== undefined) {
              printer.text(`Subtotal: C$${parseFloat(data.totals.subtotal).toFixed(2)}`);
            }
            if (data.totals.tax !== undefined) {
              printer.text(`IVA: C$${parseFloat(data.totals.tax).toFixed(2)}`);
            }
            if (data.totals.discount !== undefined && data.totals.discount > 0) {
              printer.text(`Descuento: -C$${parseFloat(data.totals.discount).toFixed(2)}`);
            }
            
            printer.style('b');
            printer.size(1, 1);
            printer.text(`TOTAL: C$${parseFloat(data.totals.total).toFixed(2)}`);
            printer.style('normal');
            printer.size(0, 0);
          }

          // Print payment info
          if (data.payment) {
            printer.text('--------------------------------');
            printer.align('lt');
            printer.text(`Pago: ${data.payment.method || 'Efectivo'}`);
            if (data.payment.received) {
              printer.text(`Recibido: C$${parseFloat(data.payment.received).toFixed(2)}`);
            }
            if (data.payment.change) {
              printer.text(`Cambio: C$${parseFloat(data.payment.change).toFixed(2)}`);
            }
          }

          // Print footer
          printer.text('--------------------------------');
          printer.align('ct');
          if (data.footer) {
            printer.text(data.footer);
          } else {
            printer.text('Gracias por su compra!');
          }

          // Cut paper and close
          printer
            .feed(3)
            .cut()
            .close(() => {
              resolve({ success: true });
            });

        } catch (printError) {
          resolve({ success: false, error: printError.message });
        }
      });

    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

/**
 * Test print - prints a test page
 */
async function testPrint(printerName) {
  const testData = {
    header: {
      businessName: 'AgroCentro ERP',
      address: 'Prueba de Impresion',
      phone: '0000-0000'
    },
    receipt: {
      number: 'TEST-001',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    },
    items: [
      { name: 'Producto de Prueba', quantity: 1, price: 100 }
    ],
    totals: {
      subtotal: 100,
      tax: 15,
      total: 115
    },
    footer: 'Impresion de prueba exitosa!'
  };

  return printReceipt(printerName, testData);
}

module.exports = {
  getUSBPrinters,
  printReceipt,
  testPrint
};