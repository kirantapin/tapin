export function adjustColor(color: string, amount: number): string {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));

  // Convert back to hex
  const newHex = [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

  return `#${newHex}`;
}

export function generateGradientColors(baseColor: string) {
  // Convert hex to RGB
  const r = Number.parseInt(baseColor.slice(1, 3), 16);
  const g = Number.parseInt(baseColor.slice(3, 5), 16);
  const b = Number.parseInt(baseColor.slice(5, 7), 16);

  // Create darker shade for 'from' color (20% darker)
  const darkerShade = `rgb(${r * 0.8}, ${g * 0.8}, ${b * 0.8})`;

  // Create even darker shade for 'to' color (40% darker)
  const darkestShade = `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;

  // Create lighter shade for overlay (30% lighter with transparency)
  const lighterShade = `rgba(${Math.min(r * 1.3, 255)}, ${Math.min(
    g * 1.3,
    255
  )}, ${Math.min(b * 1.3, 255)}, 0.2)`;

  return {
    from: darkerShade,
    via: baseColor,
    to: darkestShade,
    overlay: lighterShade,
  };
}

export function setThemeColor(color: string = "#ffffff") {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", color);
  }
}
