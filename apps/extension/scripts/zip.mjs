// Packs the extension for the Chrome Web Store as prisharp-<version>.zip,
// named after the manifest's version so the upload is plainly the right one.
// Plain Node, so it runs the same on Windows, macOS and Linux.

import {
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { zipSync } from "fflate";

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

const { version } = JSON.parse(readFileSync("manifest.json", "utf8"));

for (const name of readdirSync(".")) {
	if (/^prisharp(-.+)?\.zip$/.test(name)) rmSync(name);
}

const files = Object.fromEntries(
	SHIPPED.flatMap(walk).map((file) => [
		file.split("\\").join("/"),
		readFileSync(file),
	]),
);
const out = `prisharp-${version}.zip`;
writeFileSync(out, zipSync(files));
console.log(`Wrote ${out} (${Object.keys(files).length} files)`);
