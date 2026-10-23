import { defineConfig } from "yummacss";

export default defineConfig({
	source: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
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
		colors: {
			raised: { light: "#ffffff", dark: "#2d2f33" },
			well: { light: "#eff0f2", dark: "#18191b" },
			field: { light: "#ffffff", dark: "#18191b" },
			fill: { light: "#1e232a", dark: "#e6e9ec" },
			"on-fill": { light: "#ffffff", dark: "#1e232a" },
			label: { light: "#1e232a", dark: "#ececee" },
			hint: { light: "#64748b", dark: "#9a9ca3" },
			rim: { light: "#d1d5dc", dark: "#424447" },
			shadow: { light: "#a5aebc", dark: "#0a0a0b" },
			line: { light: "#e1e3e7", dark: "#2f3032" },
			check: { light: "#2563eb", dark: "#2563eb" },
			on: { light: "#10b981", dark: "#10b981" },
			knob: { light: "#ffffff", dark: "#e6e9ec" },
			groove: { light: "#c4c9d1", dark: "#08090a" },
			glint: { light: "#ffffff", dark: "#4f5258" },
			focus: { light: "#7a879b", dark: "#8f9bab" },
		},
	},
});
