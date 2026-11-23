import { catalog } from "virtual:catalog";
import { expect, it } from "vite-plus/test";

it("gives every technology a trace to show", () => {
	for (const tech of catalog) {
		expect(tech.evidence.length, tech.name).toBeGreaterThan(0);
		for (const line of tech.evidence) {
			expect(line.text.length, tech.name).toBeGreaterThan(0);
			expect(line.text, tech.name).not.toContain("[object");
		}
	}
});

it("names what a technology brings in, not its id", () => {
	const names = new Set(catalog.map((tech) => tech.name));
	for (const tech of catalog) {
		for (const name of tech.implies) expect(names.has(name), name).toBe(true);
	}
});
