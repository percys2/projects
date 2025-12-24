export const formatCurrency = (amount) => {
  return `C$ ${(amount || 0).toLocaleString("es-NI", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-NI");
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("es-NI");
};