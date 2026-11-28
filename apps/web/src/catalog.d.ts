/** A technology Prisharp detects, without the fingerprints. */
type CatalogEntry = {
	id: string;
	name: string;
	icon?: string;
	category: string;
	website: string;
	/** The names of what it brings in. */
	implies: string[];
	/** Up to three traces Prisharp looks for, without values; all of them in the docs. */
	evidence: {
		kind: string;
		text: string;
		/** Counts half, so it needs a second trace. Only in the docs. */
		weak?: boolean;
	}[];
};

/** What the landing page shows: a fixed slice, however big the catalog. */
declare module "virtual:catalog" {
	/** How many technologies Prisharp detects. */
	export const count: number;
	/** The zip download's path, named after the extension's version. */
	export const zip: string;
	/** The Firefox build's zip, named the same way. */
	export const firefoxZip: string;
	/** What each build asks the browser for, from its manifest. */
	export const permissions: string[];
	export const firefoxPermissions: string[];
	/** What the count on the toolbar icon asks for, when it's turned on. */
	export const hostPermissions: string[];
	/** The names the heading types, best known first, with their evidence. */
	export const typed: CatalogEntry[];
	/** The marquee's technologies, best known first. */
	export const marks: { id: string; name: string; icon: string }[];
	/** The URL of each logo file the slice uses, by file name. */
	export const logos: Record<string, string>;
}

/** Every technology. Not for the landing page, which would grow with it. */
declare module "virtual:catalog/all" {
	export const catalog: CatalogEntry[];
}

/** The docs' list: every technology with all of its evidence. */
declare module "virtual:catalog/docs" {
	export const catalog: CatalogEntry[];
	/** The categories, in the order the popup lists them. */
	export const categories: string[];
	/** The URL of every logo file, by file name. */
	export const logos: Record<string, string>;
}
