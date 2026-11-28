import { defineConfig } from "yummacss";

// The popup is drawn in prisharp.com's own style: its two fonts, cool greys
// and the one cobalt accent, light and dark. The names and values are the
// site's, from apps/web/yummacss.config.mjs, so a color reads the same in
// both places. The fonts ship inside the extension (see src/base.css).
export default defineConfig({
	source: ["./popup.html", "./src/**/*.js"],
	output: "./popup.css",
	theme: {
		fonts: {
			sans: '"Instrument Serif", ui-serif, Georgia, serif',
			mono: '"Geist Mono Variable", ui-monospace, Menlo, Consolas, monospace',
		},
		colors: {
			// the page behind the panel, and a row under the pointer
			paper: { light: "#f3f4f7", dark: "#0d0f14" },
			// the panel itself
			raised: { light: "#ffffff", dark: "#161921" },
			label: { light: "#101218", dark: "#eef0f5" },
			hint: { light: "#5b6070", dark: "#9aa1b2" },
			line: { light: "#e0e2e8", dark: "#1e222b" },
			rim: { light: "#c7cbd5", dark: "#2f3542" },
			well: { light: "#eaecf1", dark: "#0a0c10" },
			accent: { light: "#2b44ff", dark: "#8394ff" },
			logo: { light: "#8394ff", dark: "#b7c2ff" },
			"on-fill": { light: "#ffffff", dark: "#0d0f14" },
			focus: { light: "#2b44ff", dark: "#8394ff" },
		},
		boxShadow: {
			// the raised edge of the site's secondary buttons
			key: "inset 0 1px 0 light-dark(oklch(1 0 0), oklch(1 0 0 / .11)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .1), oklch(0 0 0 / .45)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .08), oklch(0 0 0 / .4))",
		},
	},
});
