import { defineConfig } from "yummacss";

// Cool grey and cobalt. The names are Yumma UI's own tokens, so its components
// draw in the site's colors through their props alone; the values are the
// site's.
export default defineConfig({
	source: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		states: {
			closing: "[data-ending-style]",
			opening: "[data-starting-style]",
		},
		keyframes: {
			spin: "to { rotate: 360deg; }",
		},
		fonts: {
			sans: '"Instrument Serif", ui-serif, Georgia, serif',
			mono: '"Geist Mono Variable", ui-monospace, Menlo, Consolas, monospace',
		},
		colors: {
			// the page
			paper: { light: "#f3f4f7", dark: "#0d0f14" },
			label: { light: "#101218", dark: "#eef0f5" },
			hint: { light: "#5b6070", dark: "#9aa1b2" },
			line: { light: "#e0e2e8", dark: "#1e222b" },
			// the one accent: the threads, the main action, "built with?"
			accent: { light: "#2b44ff", dark: "#8394ff" },
			// Yumma UI's surfaces and edges
			raised: { light: "#ffffff", dark: "#161921" },
			well: { light: "#eaecf1", dark: "#0a0c10" },
			fill: { light: "#2b44ff", dark: "#8394ff" },
			"on-fill": { light: "#ffffff", dark: "#0d0f14" },
			rim: { light: "#c7cbd5", dark: "#2f3542" },
			shadow: { light: "#b9bfcc", dark: "#000000" },
			check: { light: "#1f35d6", dark: "#a5b2ff" },
			focus: { light: "#2b44ff", dark: "#8394ff" },
			// the extension's panel, drawn in Chrome's colors as in the popup
			panel: { light: "#ffffff", dark: "#282a2c" },
			"panel-ink": { light: "#1f1f1f", dark: "#e3e3e3" },
			"panel-muted": { light: "#474747", dark: "#c4c7c5" },
			"panel-line": { light: "#e3e3e3", dark: "#444746" },
			"panel-hover": { light: "#ececec", dark: "#3a3c3e" },
			"panel-well": { light: "#f1f3f4", dark: "#1f2022" },
			"panel-ok": { light: "#146c2e", dark: "#6dd58c" },
			"panel-focus": { light: "#0b57d0", dark: "#a8c7fa" },
		},
	},
});
