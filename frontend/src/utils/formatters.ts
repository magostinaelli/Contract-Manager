export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const statusMap: Record<string, string> = {
  DRAFT: "badge badge-draft",
  EXPIRING_SOON: "badge badge-warning",
  ACTIVE: "badge badge-success",
  UNDER_RENEWAL: "badge badge-info",
  EXPIRED: "badge badge-danger",
};

const labelMap: Record<string, string> = {
  DRAFT: "BORRADOR",
  EXPIRING_SOON: "POR VENCER",
  ACTIVE: "ACTIVO",
  UNDER_RENEWAL: "EN RENOVACIÓN",
  EXPIRED: "VENCIDO",
};

export const getBadgeClass = (status: string): string => {
  return statusMap[status] || "badge";
};

export const getStatusLabel = (status: string): string => {
  return labelMap[status] || status;
};