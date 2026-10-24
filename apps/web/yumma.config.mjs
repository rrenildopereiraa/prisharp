import { defineConfig } from "yummacss";

// Ink on paper. The names are Yumma UI's own tokens, so its components draw in
// the site's colors through their props alone; the values are the site's.
export default defineConfig({
	source: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		states: {
			closing: "[data-ending-style]",
			"from-left": "[data-activation-direction=left]",
			"from-right": "[data-activation-direction=right]",
			hovering: "[data-hovering]",
			opening: "[data-starting-style]",
			scrolling: "[data-scrolling]",
			swiping: "[data-swiping]",
		},
		easings: {
			"in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
			"out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
			"out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
		},
		keyframes: {
			pulse: "0%, 100% { opacity: .5; } 50% { opacity: 1; }",
			slide: "from { translate: -100% 0; } to { translate: 100% 0; }",
			spin: "to { rotate: 360deg; }",
		},
		fonts: {
			serif: '"Fraunces Variable", Georgia, serif',
			mono: '"Geist Mono Variable", ui-monospace, Menlo, Consolas, monospace',
		},
		colors: {
			// the page
			paper: { light: "#f5f3ee", dark: "#151412" },
			label: { light: "#23201b", dark: "#ece8df" },
			hint: { light: "#5c564b", dark: "#a8a091" },
			line: { light: "#ddd8cc", dark: "#2f2c27" },
			// Yumma UI's surfaces and edges
			raised: { light: "#ffffff", dark: "#201e1b" },
			well: { light: "#ece8df", dark: "#0f0e0c" },
			field: { light: "#ffffff", dark: "#201e1b" },
			fill: { light: "#23201b", dark: "#ece8df" },
			"on-fill": { light: "#f5f3ee", dark: "#151412" },
			rim: { light: "#948c7c", dark: "#57524a" },
			shadow: { light: "#b9b2a3", dark: "#000000" },
			check: { light: "#23201b", dark: "#ece8df" },
			on: { light: "#23201b", dark: "#ece8df" },
			knob: { light: "#ffffff", dark: "#201e1b" },
			groove: { light: "#ddd8cc", dark: "#0a0a09" },
			glint: { light: "#ffffff", dark: "#3d3a33" },
			focus: { light: "#5c564b", dark: "#a8a091" },
			// the extension's panel, drawn in Chrome's colors as in the popup
			panel: { light: "#ffffff", dark: "#282a2c" },
			"panel-ink": { light: "#1f1f1f", dark: "#e3e3e3" },
			"panel-muted": { light: "#474747", dark: "#c4c7c5" },
			"panel-line": { light: "#e3e3e3", dark: "#444746" },
			"panel-hover": { light: "#ececec", dark: "#3a3c3e" },
			"panel-well": { light: "#f1f3f4", dark: "#1f2022" },
			"panel-ok": { light: "#146c2e", dark: "#6dd58c" },
		},
	},
});
