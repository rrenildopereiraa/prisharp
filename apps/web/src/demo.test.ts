import { catalog } from "virtual:catalog";
import { expect, it } from "vite-plus/test";
import { demo } from "./demo";

it("only shows technologies the catalog knows", () => {
	for (const tech of demo.technologies) {
		expect(catalog.find((entry) => entry.id === tech.id)?.name).toBe(tech.name);
	}
});

it("only names technologies it also shows", () => {
	const ids = new Set(demo.technologies.map((tech) => tech.id));
	for (const tech of demo.technologies) {
		for (const implied of tech.implies) expect(ids.has(implied)).toBe(true);
	}
});
