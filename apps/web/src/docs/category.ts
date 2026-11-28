import { useEffect, useState } from "react";
import { categoryCounts } from "virtual:catalog";

/** A category's name as it reads in an address: `#ai-app-builder`. */
export const slug = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

/** Every category with its count, A to Z, as the index lists them. */
export const CATEGORIES = [...categoryCounts].sort(([a], [b]) =>
	a.localeCompare(b, "en", { sensitivity: "base" }),
);

/** The category the page opens on: the one the popup lists first. */
export const FIRST = categoryCounts[0][0];

const fromHash = () =>
	CATEGORIES.find(([name]) => slug(name) === location.hash.slice(1))?.[0] ??
	FIRST;

/**
 * The category on screen, kept in the address's `#`, so a category can be
 * linked to, and back and forward move between the ones visited.
 */
export function useCategory() {
	const [category, setCategory] = useState(fromHash);
	useEffect(() => {
		const update = () => setCategory(fromHash());
		addEventListener("hashchange", update);
		// moving between docs pages in place changes the address without a hashchange
		addEventListener("popstate", update);
		return () => {
			removeEventListener("hashchange", update);
			removeEventListener("popstate", update);
		};
	}, []);
	return category;
}

/** Shows a category: its `#` in the address, which every reader follows. */
export const show = (name: string) => {
	location.hash = slug(name);
};
