export const hexToRgb = (
    hex: string
): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

export const mixColorWithBlack = (hex: string, percentage: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.round(rgb.r * (1 - percentage));
    const g = Math.round(rgb.g * (1 - percentage));
    const b = Math.round(rgb.b * (1 - percentage));

    return `rgb(${r}, ${g}, ${b})`;
};
