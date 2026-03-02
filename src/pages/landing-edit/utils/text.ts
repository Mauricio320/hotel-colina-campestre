export const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const weightDescription = (weight: number) => {
  switch (weight) {
    case 400:
      return 'Regular';
    case 500:
      return 'Medium';
    case 700:
      return 'Bold';
    default:
      return 'Regular';
  }
};
