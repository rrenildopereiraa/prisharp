import { defineConfig } from "yummacss";

// The popup is drawn to look like one of Chrome's own panels, such as the
// site information panel, so its colors follow Chrome's light and dark
// surfaces rather than prisharp.com.
export default defineConfig({
	source: ["./popup.html", "./src/**/*.js"],
	output: "./popup.css",
	theme: {
		colors: {
			surface: { light: "#ffffff", dark: "#282a2c" },
			ink: { light: "#1f1f1f", dark: "#e3e3e3" },
			muted: { light: "#474747", dark: "#c4c7c5" },
			line: { light: "#e3e3e3", dark: "#444746" },
			hover: { light: "#ececec", dark: "#3a3c3e" },
			well: { light: "#f1f3f4", dark: "#1f2022" },
			focus: { light: "#0b57d0", dark: "#a8c7fa" },
			ok: { light: "#146c2e", dark: "#6dd58c" },
		},
	},
});
