
export const COLORS = [
  "#6D28D9", // purple (primary)
  "#0D9488", // teal
  "#D97706", // amber
  "#2563EB", // blue
  "#7C3AED", // violet
  "#059669", // green
  "#DC2626", // red (use sparingly)
  "#374151", // gray
];

export const getColorByID = (id: number | string) => {
  const hash =
    typeof id === "number"
      ? id
      : id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return COLORS[hash % COLORS.length];
};

export const getToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

export const getCurrentMonth = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 7); // YYYY-MM
};

export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(end) };
}

export function getYearRange(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31);

  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(end) };
}

export const formatMoney = (
  value?: number | null,
  currency = "Rs."
) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }

  return `${currency} ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

