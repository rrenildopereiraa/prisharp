// The Firefox build's manifest, shared by `pnpm zip` and prisharp.com's
// download so both ship the same thing.

/** Only Chrome needs these: they turn the toolbar icon with the color scheme. */
export const CHROME_ONLY = [
	"offscreen.html",
	"src/offscreen.js",
	"src/background.js",
];

/**
 * Firefox has no offscreen documents and no background service worker, but it
 * turns the toolbar icon with its theme by itself through `theme_icons`, so
 * its build needs no background at all. AMO also asks for an ID and for what
 * the extension collects: nothing. `data_collection_permissions` needs
 * Firefox 140.
 */
export const firefox = (manifest) => {
	const { background: _background, ...rest } = manifest;
	const { default_icon: _icon, ...action } = manifest.action;
	const tone = (name, size) => `icons/action/${name}-${size}.png`;
	return {
		...rest,
		permissions: manifest.permissions.filter((name) => name !== "offscreen"),
		action: {
			// Without a default_icon, Firefox's own theme follows these icons
			// too. "light" shows on dark themes, "dark" on light ones.
			...action,
			theme_icons: [16, 32].map((size) => ({
				light: tone("dark", size),
				dark: tone("light", size),
				size,
			})),
		},
		browser_specific_settings: {
			gecko: {
				id: "prisharp@prisharp.com",
				strict_min_version: "140.0",
				data_collection_permissions: { required: ["none"] },
			},
		},
	};
};
