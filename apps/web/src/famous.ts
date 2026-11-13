// The technologies most people know, in roughly that order. A hand-kept
// list: no free source ranks frameworks, hosts and payment providers on one
// scale. The marquee and the heading lead with these, so the first names a
// visitor sees are ones they use; the rest follow in the catalog's order.
const FAMOUS = [
	"react",
	"nextjs",
	"tailwindcss",
	"vue",
	"wordpress",
	"shopify",
	"vercel",
	"stripe",
	"cloudflare",
	"angular",
	"svelte",
	"vite",
	"google-analytics",
	"nuxt",
	"astro",
	"supabase",
	"firebase",
	"github",
	"netlify",
	"bootstrap",
	"jquery",
	"framer",
	"webflow",
	"shadcn",
	"threejs",
	"sentry",
	"webpack",
	"figma",
];
/** Where a technology falls: its place in the list, or after all of it. */
export const rank = (id: string) => {
	const index = FAMOUS.indexOf(id);
	return index === -1 ? FAMOUS.length : index;
};
