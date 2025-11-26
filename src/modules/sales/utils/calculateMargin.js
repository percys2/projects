export function calculateMargin(subtotal, costo_venta) {
  const margen = subtotal - costo_venta;
  const porcentaje =
    costo_venta > 0 ? Number((margen / costo_venta).toFixed(6)) : 0;

  return { margen, porcentaje };
}
