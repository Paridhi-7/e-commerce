import { getVendor } from "./vendors";

export const money = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const productHref = (slug: string) => `/product/${slug}`;
export const vendorHref = (slug: string) => `/vendor/${slug}`;

export const vendorName = (id: string) => getVendor(id)?.name ?? "Independent";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const shortDate = (ts: number) => {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

export const longDate = (ts: number) => {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
