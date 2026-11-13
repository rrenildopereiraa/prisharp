// Writes the list of technologies into the repository's README, between the
// technologies markers, from src/technologies.js. A test fails when the two
// drift, so run `pnpm readme` after adding a technology.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { categories, technologies } from "../src/technologies.js";

export const README = fileURLToPath(
	new URL("../../../README.md", import.meta.url),
);

const START = "<!-- technologies:start -->";
const END = "<!-- technologies:end -->";

const link = ({ name, website }) => (website ? `[${name}](${website})` : name);

export function list() {
	const rows = categories
		.map((category) => {
			const names = technologies
				.filter((tech) => tech.category === category)
				.map(link);
			return names.length ? `- **${category}:** ${names.join(", ")}` : "";
		})
		.filter(Boolean);

	return [
		START,
		"",
		`Prisharp detects ${technologies.length} technologies.`,
		"",
		...rows,
		"",
		END,
	].join("\n");
}

export function render(readme) {
	const start = readme.indexOf(START);
	const end = readme.indexOf(END);
	if (start < 0 || end < 0) throw new Error(`README needs ${START} and ${END}`);
	return readme.slice(0, start) + list() + readme.slice(end + END.length);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	writeFileSync(README, render(readFileSync(README, "utf8")));
}
