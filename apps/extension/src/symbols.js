// Tabler Icons (MIT), the icon set prisharp.com draws with, outlined on a
// 24px grid. Paths from @tabler/icons.

export const paths = {
	back: ["M5 12l14 0", "M5 12l6 6", "M5 12l6 -6"],
	close: ["M18 6l-12 12", "M6 6l12 12"],
	settings: [
		"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065",
		"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0",
	],
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
