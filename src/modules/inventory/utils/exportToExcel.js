export function exportInventoryToPDF(products, branchName = "Todas") {
  const groupedByAnimal = {};
  
  for (const product of products) {
    const animalType = product.subcategory || "SIN CLASIFICAR";
    if (!groupedByAnimal[animalType]) {
      groupedByAnimal[animalType] = [];
    }
    groupedByAnimal[animalType].push(product);
  }

  const sortedGroups = Object.keys(groupedByAnimal).sort();
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const printWindow = window.open("", "_blank");
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventario Fisico - ${branchName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header p { font-size: 12px; color: #666; }
        .summary { display: flex; justify-content: center; gap: 60px; margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 10px; color: #666; }
        .summary-item .value { font-size: 14px; font-weight: bold; }
        .group { margin-bottom: 20px; page-break-inside: avoid; }
        .group-header { background: #e0e0e0; padding: 8px 10px; font-weight: bold; font-size: 12px; border-radius: 3px; margin-bottom: 5px; }
        .group-header span { float: right; font-weight: normal; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #f0f0f0; padding: 6px 8px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 5px 8px; border: 1px solid #ddd; }
        .stock-col { text-align: center; width: 100px; }
        .physical-col { text-align: center; width: 100px; }
        .diff-col { text-align: center; width: 100px; }
        .subtotal { background: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .signature { display: flex; justify-content: space-between; margin-top: 40px; }
        .signature-line { width: 200px; text-align: center; }
        .signature-line .line { border-top: 1px solid #333; margin-bottom: 5px; }
        @media print { body { padding: 10px; } .group { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVENTARIO FISICO</h1>
        <p>Sucursal: ${branchName.toUpperCase()} | Fecha: ${new Date().toLocaleDateString("es-NI")}</p>
      </div>
      <div class="summary">
        <div class="summary-item"><div class="label">Total Productos</div><div class="value">${products.length}</div></div>
        <div class="summary-item"><div class="label">Total Unidades Sistema</div><div class="value">${totalStock.toLocaleString("es-NI")}</div></div>
      </div>
  `;

  for (const groupName of sortedGroups) {
    const groupProducts = groupedByAnimal[groupName];
    const groupTotal = groupProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    
    html += `
      <div class="group">
        <div class="group-header">${groupName}<span>${groupProducts.length} productos | ${groupTotal} unidades</span></div>
        <table>
          <thead><tr><th>Codigo</th><th>Producto</th><th class="stock-col">Stock Sistema</th><th class="physical-col">Stock Fisico</th><th class="diff-col">Diferencia</th></tr></thead>
          <tbody>`;
    
    for (const p of groupProducts) {
      html += `<tr><td>${p.sku || ""}</td><td>${p.name || ""}</td><td class="stock-col">${p.stock || 0}</td><td class="physical-col"></td><td class="diff-col"></td></tr>`;
    }
    
    html += `</tbody><tfoot><tr class="subtotal"><td colspan="2">Subtotal ${groupName}</td><td class="stock-col">${groupTotal}</td><td class="physical-col"></td><td class="diff-col"></td></tr></tfoot></table></div>`;
  }

  html += `
      <div class="footer">
        <div class="signature">
          <div class="signature-line"><div class="line"></div><div>Firma Responsable</div></div>
          <div class="signature-line"><div class="line"></div><div>Fecha de Conteo</div></div>
          <div class="signature-line"><div class="line"></div><div>Revisado Por</div></div>
        </div>
      </div>
    </body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 250);
}

export function exportInventoryToExcel(products, branchName = "Todas") {
  const groupedByAnimal = {};
  for (const product of products) {
    const animalType = product.subcategory || "SIN CLASIFICAR";
    if (!groupedByAnimal[animalType]) groupedByAnimal[animalType] = [];
    groupedByAnimal[animalType].push(product);
  }

  const sortedGroups = Object.keys(groupedByAnimal).sort();
  let csvContent = "";
  csvContent += "INVENTARIO FISICO\n";
  csvContent += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
  csvContent += `Sucursal: ${branchName}\n`;
  csvContent += `Total Productos: ${products.length}\n\n`;

  for (const groupName of sortedGroups) {
    const groupProducts = groupedByAnimal[groupName];
    const groupTotal = groupProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    csvContent += `\n=== ${groupName} (${groupProducts.length} productos) ===\n`;
    csvContent += "Codigo,Producto,Stock Sistema,Stock Fisico,Diferencia,Costo,Precio,Bodega\n";
    for (const p of groupProducts) {
      csvContent += `"${p.sku || ''}","${(p.name || '').replace(/"/g, '""')}",${p.stock || 0},,,${p.cost || 0},${p.price || 0},"${p.branch || ''}"\n`;
    }
    csvContent += `Subtotal ${groupName}:,${groupProducts.length} productos,${groupTotal} unidades,,,,,\n`;
  }

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.cost || 0), 0);
  csvContent += `\nTOTAL GENERAL:,${products.length} productos,${totalStock} unidades,,,,C$ ${totalValue},\n`;
  csvContent += "\nFirma Responsable:,____________________\nFecha Conteo:,____________________\n";

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventario_${branchName.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}