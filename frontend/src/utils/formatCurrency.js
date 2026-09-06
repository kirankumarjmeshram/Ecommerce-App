const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export default function formatCurrency(value) { return currency.format(Number(value) || 0); }
