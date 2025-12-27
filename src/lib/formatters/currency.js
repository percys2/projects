export const formatCurrency = (amount, locale = "es-NI", currency = "C$") => {
  return `${currency} ${(amount || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPercent = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

export const formatNumber = (value, locale = "es-NI") => {
  return (value || 0).toLocaleString(locale);
};

export const formatDate = (dateString, locale = "es-NI", options = {}) => {
  if (!dateString) return "";
  const defaultOptions = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(locale, { ...defaultOptions, ...options });
};