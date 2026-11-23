import { catalog } from "virtual:catalog/all";
import { count, logos, marks, typed } from "virtual:catalog";
import { icons as files } from "extension/icons";
import { expect, it } from "vite-plus/test";
import { MARQUEE_MAX, TYPED_MAX, marquee } from "./slices";

it("counts the whole catalog", () => {
	expect(count).toBe(catalog.length);
});

it("caps what the landing page ships, however big the catalog", () => {
	expect(typed.length).toBeLessThanOrEqual(TYPED_MAX);
	expect(marks.length).toBeLessThanOrEqual(MARQUEE_MAX);
	expect(Object.keys(logos).length).toBeLessThanOrEqual(
		2 * (TYPED_MAX + MARQUEE_MAX),
	);

	const many = Array.from({ length: 5000 }, (_, index) => ({
		id: `tech-${index}`,
		name: `Tech ${index}`,
		icon: "yummacss",
		category: "Framework",
	}));
	expect(marquee(many, () => true).length).toBe(MARQUEE_MAX);
});

it("leads with the best known", () => {
	expect(typed[0].name).toBe("React");
	expect(marks[0].id).toBe("react");
});

it("ships the logo of every name the heading types, and no others", () => {
	const wanted = typed
		.map((tech) => tech.icon ?? tech.id)
		.filter((icon) => icon in files);
	for (const icon of wanted) expect(logos[icon], icon).toBeTruthy();
	expect(Object.keys(logos).length).toBeLessThan(Object.keys(files).length);
});
