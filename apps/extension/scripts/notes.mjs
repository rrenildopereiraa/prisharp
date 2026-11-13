// Prints the release notes for the manifest's version, read from that
// version's section of the repository's CHANGELOG. The release workflow
// publishes them as the GitHub release's body.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const CHANGELOG = fileURLToPath(
	new URL("../../../CHANGELOG.md", import.meta.url),
);

// The body of `## [version] - date`, up to the next release heading or the
// link definitions at the bottom.
export function notes(changelog, version) {
	const lines = changelog.split("\n");
	const start = lines.findIndex((line) =>
		line.startsWith(`## [${version}] - `),
	);
	if (start < 0) return undefined;
	const rest = lines.slice(start + 1);
	const end = rest.findIndex(
		(line) => line.startsWith("## [") || /^\[.+\]: /.test(line),
	);
	return rest
		.slice(0, end < 0 ? undefined : end)
		.join("\n")
		.trim();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const manifest = new URL("../manifest.json", import.meta.url);
	const { version } = JSON.parse(readFileSync(manifest, "utf8"));
	const body = notes(readFileSync(CHANGELOG, "utf8"), version);
	if (!body) {
		console.error(`CHANGELOG.md has no section for ${version}`);
		process.exit(1);
	}
	console.log(body);
}
