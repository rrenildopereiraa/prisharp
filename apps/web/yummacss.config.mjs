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
			"from-left": "[data-activation-direction=left]",
			"from-right": "[data-activation-direction=right]",
			hovering: "[data-hovering]",
			indented: "[data-active]",
			nested: "[data-nested-drawer-open]",
			resizing: "[data-separator=active]",
			scrolling: "[data-scrolling]",
			swiping: "[data-swiping]",
		},

		keyframes: {
			spin: "to { rotate: 360deg; }",
			leave: "from { opacity: 1; scale: 1; }",
			marquee: "to { translate: calc(var(--marquee-shift) * -1) 0; }",
			blink: "0%, 45% { opacity: 1; } 55%, 100% { opacity: 0; }",
			reveal: "from { opacity: 0; filter: blur(4px); }",
			shimmer: "from { mask-position: 100% 0; } to { mask-position: 0 0; }",
			pulse: "0%, 100% { opacity: .5; } 50% { opacity: 1; }",
			slide: "from { translate: -100% 0; } to { translate: 100% 0; }",
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

			// the mark's sky: a step lighter than the accent, so its two tones stay apart
			logo: { light: "#8394ff", dark: "#b7c2ff" },

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

			field: {
				light: "oklch(1 0 none)",
				dark: "oklch(0.215 0.007 290)",
			},

			edge: {
				light: "oklch(0.18 0.008 286)",
				dark: "oklch(0.1 0.004 290)",
			},

			chip: {
				light: "oklch(0.958 0.003 286)",
				dark: "oklch(0.3 0.008 290)",
			},

			on: {
				light: "oklch(0.27 0.009 286)",
				dark: "oklch(0.93 0.005 286)",
			},

			knob: {
				light: "oklch(1 0 none)",
				dark: "oklch(0.36 0.008 290)",
			},
		},

		easings: {
			"in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
			"out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
			"out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
		},

		boxShadow: {
			key: "inset 0 1px 0 light-dark(oklch(1 0 0), oklch(1 0 0 / .11)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .1), oklch(0 0 0 / .45)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .08), oklch(0 0 0 / .4))",
			"key-fill":
				"inset 0 1px 0 light-dark(oklch(1 0 0 / .14), oklch(1 0 0 / .7)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .25), oklch(0 0 0 / 0)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .2), oklch(0 0 0 / .35))",
			sunk: "inset 0 1px 2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .45))",
			pop: "0 12px 28px -12px light-dark(oklch(0 0 0 / .16), oklch(0 0 0 / .7)), 0 2px 6px -2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .3))",
		},
	},
});
