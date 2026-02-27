export const isPercentage = (val: string) =>
  typeof val === 'string' && val.includes('%');

export const pxToPercent = (px: number, parentPx: number) => {
  if (!parentPx) return 0;
  return Math.round((px / parentPx) * 100);
};

export const percentToPx = (percent: string, parentPx: number) => {
  if (!parentPx) return 0;
  const val = parseFloat(percent);
  return Math.round((val / 100) * parentPx);
};

export const getElementDimensions = (element: HTMLElement | null) => {
  if (!element) return { width: 0, height: 0 };
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
};
