// Tailwind CSS color palette - vibrant, accessible colors
export const COLOR_PALETTE = [
  '#60a5fa', // blue-400
  '#f87171', // red-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#22d3ee', // cyan-400
  '#2dd4bf', // teal-400
  '#818cf8', // indigo-400
  '#e879f9', // fuchsia-400
];

export const COLOR_NAMES: Record<string, string> = {
  '#60a5fa': 'Blue',
  '#f87171': 'Red',
  '#34d399': 'Emerald',
  '#fbbf24': 'Amber',
  '#a78bfa': 'Violet',
  '#f472b6': 'Pink',
  '#22d3ee': 'Cyan',
  '#2dd4bf': 'Teal',
  '#818cf8': 'Indigo',
  '#e879f9': 'Fuchsia',
};

export function getNextAvailableColor(usedColors: string[]): string {
  for (const color of COLOR_PALETTE) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // If all colors are used, cycle back to the first one
  return COLOR_PALETTE[0];
}
