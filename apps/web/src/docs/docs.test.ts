import { technologies } from "extension/technologies";
import { permissions } from "virtual:catalog";
import { catalog, categories } from "virtual:catalog/docs";
import { expect, it } from "vite-plus/test";
import { matches, predict } from "./search";
import { USES } from "./uses";

it("lists every technology Prisharp detects, in a category it groups by", () => {
	expect(catalog.map((tech) => tech.id)).toEqual(
		technologies.map((tech) => tech.id),
	);
	for (const tech of catalog) {
		expect(categories, tech.name).toContain(tech.category);
	}
});

it("shows all of a technology's evidence, not the home page's three", () => {
	expect(catalog.some((tech) => tech.evidence.length > 3)).toBe(true);
	expect(catalog.some((tech) => tech.evidence.some((line) => line.weak))).toBe(
		true,
	);
});

it("says what every permission in the manifest is for", () => {
	for (const name of permissions) expect(USES[name], name).toBeTruthy();
});

it("finds a technology however its name is typed", () => {
	expect(matches("Next.js", "nextjs")).toBe(true);
	expect(matches("Next.js", "NEXT")).toBe(true);
	expect(matches("Tailwind CSS", "tail wind")).toBe(true);
	expect(matches("Tailwind CSS", "")).toBe(true);
	expect(matches("React", "vue")).toBe(false);
});

it("predicts the rest of a name, the full name first", () => {
	const list = [
		{ name: "Next.js App Router" },
		{ name: "Next.js" },
		{ name: "Nextra" },
		{ name: "Tailwind CSS" },
	];
	const names = (query: string) =>
		predict(list, query).map(({ tech, rest }) => [tech.name, rest]);
	expect(names("nextjs")).toEqual([
		["Next.js", ""],
		["Next.js App Router", " App Router"],
	]);
	expect(names("next")[0]).toEqual(["Next.js App Router", ".js App Router"]);
	expect(names("Next.")).toEqual([
		["Next.js App Router", "js App Router"],
		["Next.js", "js"],
		["Nextra", null],
	]);
	expect(names("wind")).toEqual([["Tailwind CSS", null]]);
	expect(names("  ")).toEqual([]);
});
