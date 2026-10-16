export const formatPrice = (value: number) => `Rs. ${value.toFixed(0)}`;

export const capitalizeWords = (value: string) =>
  value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
