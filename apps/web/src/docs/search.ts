/** A name as search compares it: lowercase, letters and digits only. */
const fold = (text: string) =>
	text
		.normalize("NFKD")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

/**
 * Whether a technology's name matches what was typed, ignoring case, spaces
 * and punctuation, so "nextjs" finds Next.js and "tail wind" Tailwind CSS.
 * An empty query matches everything.
 */
export const matches = (name: string, query: string) =>
	fold(name).includes(fold(query));
