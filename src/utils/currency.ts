/**
 * Currency utility functions for Iranian Toman
 * Converts between display format (without 3 zeros) and storage format (with 3 zeros)
 */

// Convert display amount (without 3 zeros) to storage amount (with 3 zeros)
export function toTomanStorage(amount: number): number {
  return amount * 1000;
}

// Convert storage amount (with 3 zeros) to display amount (without 3 zeros)
export function fromTomanStorage(amount: number): number {
  return amount / 1000;
}

// Format amount for display (without 3 zeros, with Toman symbol)
export function formatToman(amount: number): string {
  const displayAmount = fromTomanStorage(amount);
  return `${displayAmount.toLocaleString('fa-IR')} تومان`;
}

// Format amount for display (without 3 zeros, just number)
export function formatTomanNumber(amount: number): string {
  const displayAmount = fromTomanStorage(amount);
  return displayAmount.toLocaleString('fa-IR');
}

// Format amount for display with currency symbol (for inputs and forms)
export function formatTomanForInput(amount: number): string {
  const displayAmount = fromTomanStorage(amount);
  return `${displayAmount.toLocaleString('fa-IR')}`;
}

// Parse input value (without 3 zeros) to storage value (with 3 zeros)
export function parseTomanInput(value: string): number {
  const numericValue = parseFloat(value.replace(/,/g, ''));
  return isNaN(numericValue) ? 0 : toTomanStorage(numericValue);
}