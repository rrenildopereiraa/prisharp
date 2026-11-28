// Tabler Icons (MIT), the icon set prisharp.com draws with, outlined on a
// 24px grid. Paths from @tabler/icons.

export const paths = {
	back: ["M5 12l14 0", "M5 12l6 6", "M5 12l6 -6"],
	check: ["M5 12l5 5l10 -10"],
	chevron: ["M9 6l6 6l-6 6"],
	close: ["M18 6l-12 12", "M6 6l12 12"],
	copy: [
		"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666",
		"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",
	],
	markdown: [
		"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10",
		"M7 15v-6l2 2l2 -2v6",
		"M14 13l2 2l2 -2m-2 2v-6",
	],
	external: [
		"M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6",
		"M11 13l9 -9",
		"M15 4h5v5",
	],
	info: ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M12 9h.01", "M11 12h1v4h1"],
	count: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M10 10l2 -2v8"],
};

/** How each icon is drawn, as SVG attributes, the same in the popup and on prisharp.com. */
export const stroke = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "1.75",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
};

const NS = "http://www.w3.org/2000/svg";

// An icon as inline SVG, colored by `currentColor` and hidden from assistive
// technology: the control around it carries the name.
export function symbol(name, classes = "") {
	const svg = document.createElementNS(NS, "svg");
	for (const [key, value] of Object.entries(stroke)) {
		svg.setAttribute(key, value);
	}
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("class", classes);
	for (const d of paths[name]) {
		const path = document.createElementNS(NS, "path");
		path.setAttribute("d", d);
		svg.append(path);
	}
	return svg;
}
