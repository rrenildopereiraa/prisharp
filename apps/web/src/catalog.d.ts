declare module "virtual:catalog" {
	/** What Prisharp detects, without the fingerprints. */
	export const catalog: { id: string; name: string; icon?: string }[];
}
