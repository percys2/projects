/* 
  UNIVERSAL ESC/POS PRINT SERVICE
  Compatible:
  - Epson TM series (TM-T20, TM-T88)
  - Bixolon SRP series
  - StarMicronics
  - Sunmi
  - Cualquier impresora ESC/POS

  Métodos disponibles:
  printTicket(sale)
  connectUSB()
  connectBluetooth()
  connectNetwork(ip, port)
*/

export const printService = {
  async printTicket(sale) {
    try {
      // 1. Intento via WebUSB
      const usb = await this.connectUSB();
      if (usb) return this._sendTicketToUSB(usb, sale);

      // 2. Intento via Network (IP)
      if (sale.printerIP) {
        return this._sendTicketToNetwork(sale.printerIP, sale);
      }

      // 3. Intento via Web Bluetooth
      const bt = await this.connectBluetooth();
      if (bt) return this._sendTicketToBluetooth(bt, sale);

      alert("No hay impresora conectada. Revisa USB, Bluetooth o IP.");
    } catch (err) {
      console.error("Error printing:", err);
    }
  },

  /* ===========================
        CONNECT USB
  ============================ */
  async connectUSB() {
    if (!navigator.usb) return null;

    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x04b8 }, { vendorId: 0x1504 }], 
        // Epson + Bixolon vendors
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      return device;
    } catch {
      return null;
    }
  },

  /* ===========================
       CONNECT BLUETOOTH
  ============================ */
  async connectBluetooth() {
    if (!navigator.bluetooth) return null;

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "0000ffe0-0000-1000-8000-00805f9b34fb"
      );

      const characteristic = await service.getCharacteristic(
        "0000ffe1-0000-1000-8000-00805f9b34fb"
      );

      return characteristic;
    } catch {
      return null;
    }
  },

  /* ===========================
       CONNECT NETWORK IP
  ============================ */
  async connectNetwork(ip, port = 9100) {
    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(`ws://${ip}:${port}`);
        socket.binaryType = "arraybuffer";
        socket.onopen = () => resolve(socket);
        socket.onerror = reject;
      } catch (err) {
        reject(err);
      }
    });
  },

  /* ===========================
        TICKET FORMAT ESC/POS
  ============================ */
  buildTicket(sale) {
    const encoder = new TextEncoder();

    let esc = "";
    esc += "\x1B\x40"; // INIT
    esc += "\x1B\x61\x01"; // CENTER
    esc += "AGROCENTRO NICA\n";
    esc += "RUC: 401-010200-1002D\n";
    esc += "------------------------------\n";
    esc += `Factura: ${sale.invoice}\n`;
    esc += `Fecha: ${sale.date}\n`;
    esc += `Cliente: ${sale.client_name}\n`;
    esc += "------------------------------\n";
    esc += "\x1B\x61\x00"; // LEFT

    sale.items.forEach((i) => {
      esc += `${i.qty} x ${i.name}\n`;
      esc += `  ${i.price.toFixed(2)}   C$ ${(i.qty * i.price).toFixed(2)}\n`;
    });

    esc += "------------------------------\n";
    esc += `Subtotal:   C$ ${sale.subtotal.toFixed(2)}\n`;
    esc += `IVA 15%:    C$ ${sale.tax.toFixed(2)}\n`;
    esc += `TOTAL:      C$ ${sale.total.toFixed(2)}\n`;
    esc += "------------------------------\n";
    esc += "Gracias por su compra!\n";
    esc += "\n\n\n\n";
    esc += "\x1D\x56\x42\x00"; // CUT

    return encoder.encode(esc);
  },

  /* ===========================
        SEND TO USB
  ============================ */
  async _sendTicketToUSB(device, sale) {
    const data = this.buildTicket(sale);

    await device.transferOut(1, data);
    await device.close();
  },

  /* ===========================
     SEND TO BLUETOOTH
  ============================ */
  async _sendTicketToBluetooth(characteristic, sale) {
    const data = this.buildTicket(sale);
    return characteristic.writeValue(data);
  },

  /* ===========================
       SEND TO NETWORK
  ============================ */
  async _sendTicketToNetwork(ip, sale) {
    const socket = await this.connectNetwork(ip);
    const data = this.buildTicket(sale);

    socket.send(data);
    socket.close();
  },
};
