import { defineConfig } from "yummacss";

// Cool grey and cobalt. The names are Yumma UI's own tokens, so its components
// draw in the site's colors through their props alone; the values are the
// site's.
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
			shake:
				"10%, 90% { translate: -1px 0; } 20%, 80% { translate: 2px 0; } 30%, 50%, 70% { translate: -3px 0; } 40%, 60% { translate: 3px 0; }",
			slide: "from { translate: -100% 0; } to { translate: 100% 0; }",
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
			field: { light: "#ffffff", dark: "#161921" },
			fill: { light: "#2b44ff", dark: "#8394ff" },
			"on-fill": { light: "#ffffff", dark: "#0d0f14" },
			rim: { light: "#c7cbd5", dark: "#2f3542" },
			// a field's border, dark enough to read as one (3:1 on white)
			edge: { light: "#8b91a0", dark: "#5a6273" },
			shadow: { light: "#b9bfcc", dark: "#000000" },
			check: { light: "#1f35d6", dark: "#a5b2ff" },
			on: { light: "#2b44ff", dark: "#8394ff" },
			knob: { light: "#ffffff", dark: "#161921" },
			groove: { light: "#e0e2e8", dark: "#07080b" },
			glint: { light: "#ffffff", dark: "#2a2f3a" },
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
