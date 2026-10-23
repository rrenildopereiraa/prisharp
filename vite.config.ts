import { defineConfig } from "vite-plus";

// format & lint settings for every package; each package's own config builds it
export default defineConfig({
	fmt: {
		useTabs: true,
		printWidth: 80,
		// generated: the popup's CSS, the svgl logos and the Yumma UI components
		ignorePatterns: [
			"apps/extension/popup.css",
			"apps/extension/icons/**",
			"apps/extension/src/icons.js",
			"apps/web/src/components/ui/**",
		],
	},
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
		ignorePatterns: ["apps/web/src/components/ui/**"],
	},
	run: {
		cache: true,
	},
});
