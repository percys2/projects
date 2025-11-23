export const formatCurrency = (n) =>
  "C$ " +
  n.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
  });
