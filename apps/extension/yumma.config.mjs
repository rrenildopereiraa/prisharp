import { defineConfig } from "yummacss";

export default defineConfig({
	source: ["./popup.html", "./src/**/*.js"],
	output: "./popup.css",
	theme: {
		colors: {
			accent: { light: "#5d68cc", dark: "#bec6f2" },
			ink: { light: "#1f2227", dark: "#e8e9ec" },
			"ink-dim": { light: "#61656e", dark: "#9a9ea8" },
			"knob-edge": { light: "#e1e3e6", dark: "#3a3d45" },
			divider: { light: "#d3d5d9", dark: "#0d0e11" },
			glow: { light: "#2fe381", dark: "#2fe381" },
			"capsule-edge": { light: "#3be68a", dark: "#3be68a" },
			"capsule-ink": { light: "#0a5432", dark: "#0a5432" },
			"capsule-ink-dim": { light: "#13723f", dark: "#13723f" },
		},
	},
});
