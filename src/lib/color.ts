import tinycolor from "tinycolor2";

export function contrastColor(color: string): "#000000" | "#ffffff" {
	return tinycolor(color).isLight() ? "#000000" : "#ffffff";
}

// A translucent line color guaranteed to stay visible against `background`:
// darker than light backgrounds, lighter than dark ones, regardless of hue.
export function patternLineColor(background: string): string {
	const color = tinycolor(background);
	const line = color.isLight() ? color.darken(12) : color.lighten(16);
	return line.setAlpha(0.4).toRgbString();
}

// A hover-state shade for a solid-colored control (e.g. an accent-filled
// button): darker on light colors, lighter on dark ones, so the hover
// feedback reads the same way regardless of which theme's accent it's
// shading.
export function hoverShade(color: string, amount = 8): string {
	const c = tinycolor(color);
	return (c.isLight() ? c.darken(amount) : c.lighten(amount)).toHexString();
}

// Forces a fixed alpha onto a color regardless of whatever alpha it already
// carries (VS Code theme colors are sometimes solid, sometimes already
// semi-transparent) - highlight overlays need a consistent, predictable
// opacity so the code underneath always stays legible.
export function overlayColor(color: string, alpha: number): string {
	return tinycolor(color).setAlpha(alpha).toRgbString();
}
