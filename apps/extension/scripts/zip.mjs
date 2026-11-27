// Packs the extension for each store, named after the manifest's version so
// the upload is plainly the right one:
// - prisharp-<version>.zip for the Chrome Web Store, as the folder is
// - prisharp-firefox-<version>.zip for addons.mozilla.org, with its own
//   manifest (see firefox() below)
// Plain Node, so it runs the same on Windows, macOS and Linux.

import {
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { strToU8, zipSync } from "fflate";

const SHIPPED = [
	"manifest.json",
	"popup.html",
	"offscreen.html",
	"popup.css",
	"src",
	"icons",
];

/** Only Chrome needs these: they turn the toolbar icon with the color scheme. */
const CHROME_ONLY = ["offscreen.html", "src/offscreen.js", "src/background.js"];

/**
 * Firefox has no offscreen documents and no background service worker, but it
 * turns the toolbar icon with its theme by itself through `theme_icons`, so
 * its build needs no background at all. AMO also asks for an ID and for what
 * the extension collects: nothing. `data_collection_permissions` needs
 * Firefox 140.
 */
const firefox = (manifest) => {
	const { background, ...rest } = manifest;
	const { default_icon, ...action } = manifest.action;
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

const walk = (path) =>
	statSync(path).isDirectory()
		? readdirSync(path).flatMap((name) => walk(join(path, name)))
		: [path];

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));

for (const name of readdirSync(".")) {
	if (/^prisharp(-.+)?\.zip$/.test(name)) rmSync(name);
}

const files = Object.fromEntries(
	SHIPPED.flatMap(walk).map((file) => [
		file.split("\\").join("/"),
		readFileSync(file),
	]),
);

const write = (out, contents) => {
	writeFileSync(out, zipSync(contents));
	console.log(`Wrote ${out} (${Object.keys(contents).length} files)`);
};

write(`prisharp-${manifest.version}.zip`, files);

const gecko = Object.fromEntries(
	Object.entries(files).filter(([file]) => !CHROME_ONLY.includes(file)),
);
gecko["manifest.json"] = strToU8(
	`${JSON.stringify(firefox(manifest), null, "\t")}\n`,
);
write(`prisharp-firefox-${manifest.version}.zip`, gecko);
