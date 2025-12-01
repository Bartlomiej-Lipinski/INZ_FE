export function formatDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "Brak danych";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) return "Brak danych";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear());

  return `${day}.${month}.${year}`;
}

export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString().split("T")[0];
}

