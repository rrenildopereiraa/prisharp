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

/** A technology the search predicts, and what to show after what was typed. */
export type Prediction<T> = {
	tech: T;
	/**
	 * The rest of its name after what was typed, as grey text: `.js` after
	 * "next". `null` when the name has what was typed in its middle instead,
	 * so it can only be named, not finished.
	 */
	rest: string | null;
};

/**
 * Where a name stops covering what was typed, counting only its letters and
 * digits: "Next.js" covers "nextj" up to its "j", so the rest is "s".
 */
const covered = (name: string, typed: number) => {
	let seen = 0;
	for (let index = 0; index < name.length; index++) {
		if (seen === typed) return index;
		seen += fold(name[index]).length;
	}
	return name.length;
};

/** What was typed after its last letter or digit. */
const trailing = (query: string) => query.match(/[^\p{L}\p{N}]*$/u)?.[0] ?? "";

/**
 * Every technology whose name matches what was typed, best first: the name
 * typed in full, then names that start with it, then names that have it
 * anywhere, each group in the order given.
 */
export function predict<T extends { name: string }>(
	list: readonly T[],
	query: string,
): Prediction<T>[] {
	const typed = fold(query);
	if (typed === "") return [];
	const exact: Prediction<T>[] = [];
	const starts: Prediction<T>[] = [];
	const inside: Prediction<T>[] = [];
	for (const tech of list) {
		const name = fold(tech.name);
		if (name === typed) exact.push({ tech, rest: "" });
		else if (name.startsWith(typed)) {
			let at = covered(tech.name, typed.length);
			// punctuation typed after the last letter is typed, not predicted:
			// "next." goes on with "js", not ".js"
			// and a name that doesn't go on that way can only be named
			const marks = trailing(query);
			if (tech.name.startsWith(marks, at)) {
				starts.push({ tech, rest: tech.name.slice(at + marks.length) });
			} else inside.push({ tech, rest: null });
		} else if (name.includes(typed)) inside.push({ tech, rest: null });
	}
	return [...exact, ...starts, ...inside];
}
