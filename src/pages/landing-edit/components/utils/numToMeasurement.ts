export const isPercentage = (val: string | number): boolean =>
  typeof val === 'string' && val.endsWith('%');

export const percentToPx = (
  val: string | number,
  parentDimension: number
): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  if (!isPercentage(val)) return parseInt(val, 10) || 0;
  const percent = parseInt(val.replace('%', ''), 10) || 0;
  return (percent / 100) * parentDimension;
};

export const pxToPercent = (px: number, parentDimension: number): number => {
  if (!parentDimension) return 0;
  return Math.round((px / parentDimension) * 100);
};

export const getElementDimensions = (
  element: HTMLElement | null
): { width: number; height: number } => {
  if (!element) return { width: 0, height: 0 };
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
};
