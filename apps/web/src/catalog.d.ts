/** A technology Prisharp detects, without the fingerprints. */
type CatalogEntry = {
	id: string;
	name: string;
	icon?: string;
	category: string;
	website: string;
	/** The names of what it brings in. */
	implies: string[];
	/** Up to three traces Prisharp looks for, without values. */
	evidence: { kind: string; text: string }[];
};

/** What the landing page shows: a fixed slice, however big the catalog. */
declare module "virtual:catalog" {
	/** How many technologies Prisharp detects. */
	export const count: number;
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
