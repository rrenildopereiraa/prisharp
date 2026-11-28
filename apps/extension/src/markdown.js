// The list as Markdown, to paste into a README, an issue or a post:
//
//   **example.com** is built with:
//
//   - App framework: [Next.js](https://nextjs.org) 16.4.6
//
// One line per technology in the order the popup lists them, each linked to
// its site, with its version when Prisharp read one.

// Brackets in a name would end the link text early.
const text = (value) => value.replace(/[[\]\\]/g, "\\$&");

export function markdown(hostname, found) {
	const lines = found.map((tech) =>
		[`- ${tech.category}: [${text(tech.name)}](${tech.website})`, tech.version]
			.filter(Boolean)
			.join(" "),
	);
	return [`**${hostname}** is built with:`, "", ...lines].join("\n");
}
