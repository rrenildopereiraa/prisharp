// Simple sRGB relative-luminance check (WCAG-ish, good enough for picking a
// readable black/white foreground against an arbitrary background hex).
export function isLightColor(hex: string): boolean {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex);
	if (!match) return true;
	const value = Number.parseInt(match[1], 16);
	const r = (value >> 16) & 0xff;
	const g = (value >> 8) & 0xff;
	const b = value & 0xff;
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6;
}

export function contrastColor(hex: string): "#000000" | "#ffffff" {
	return isLightColor(hex) ? "#000000" : "#ffffff";
}
