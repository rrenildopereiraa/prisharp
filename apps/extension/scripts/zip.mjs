// Packs the extension for each store, named after the manifest's version so
// the upload is plainly the right one:
// - prisharp-chrome-<version>.zip for the Chrome Web Store, as the folder is
// - prisharp-firefox-<version>.zip for addons.mozilla.org, with its own
//   manifest (see firefox.mjs)
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
import { CHROME_ONLY, firefox } from "./firefox.mjs";

const SHIPPED = [
	"manifest.json",
	"popup.html",
	"offscreen.html",
	"popup.css",
	"src",
	"icons",
];

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

write(`prisharp-chrome-${manifest.version}.zip`, files);

const gecko = Object.fromEntries(
	Object.entries(files).filter(([file]) => !CHROME_ONLY.includes(file)),
);
gecko["manifest.json"] = strToU8(
	`${JSON.stringify(firefox(manifest), null, "\t")}\n`,
);
write(`prisharp-firefox-${manifest.version}.zip`, gecko);
