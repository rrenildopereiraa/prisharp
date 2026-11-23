// The parts of the catalog the landing page shows. They are picked at build
// time, so the page's JavaScript stays the same size however many
// technologies Prisharp learns; the full list is only in `virtual:catalog/all`.
import { rank } from "./famous";
import { icons, pictures } from "./marks";

/** How many names the heading types, and how many logos the marquee shows. */
export const TYPED_MAX = 40;
export const MARQUEE_MAX = 48;

// "Built with" fits what a site is made of, not the icons or analytics it
// adds; and only names that fit the heading's second line with the question
// mark at every width: "built with TanStack Router?" is the longest that does.
const BUILT = new Set([
	"Framework",
	"Platform",
	"Library",
	"Components",
	"Styling",
	"Build",
]);

type Entry = { id: string; name: string; icon?: string; category: string };

// best known first; a stable sort keeps the catalog's order among the rest
const ranked = <T extends Entry>(list: T[]) =>
	[...list].sort((a, b) => rank(a.id) - rank(b.id));

/** The technologies the heading types, each with its evidence page. */
export const typed = <T extends Entry>(list: T[]) =>
	ranked(
		list.filter((tech) => BUILT.has(tech.category) && tech.name.length <= 15),
	).slice(0, TYPED_MAX);

/**
 * The technologies the marquee shows: those with a one-color mark from
 * Simple Icons, or a picture of their own logo, best known first.
 */
export const marquee = <T extends Entry>(
	list: T[],
	hasLogo: (icon: string) => boolean,
) =>
	ranked(
		list.filter((tech) => {
			const icon = tech.icon ?? tech.id;
			return tech.id in icons || (pictures.includes(icon) && hasLogo(icon));
		}),
	).slice(0, MARQUEE_MAX);
