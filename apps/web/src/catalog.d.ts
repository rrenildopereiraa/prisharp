declare module "virtual:catalog" {
	/** What Prisharp detects, without the fingerprints. */
	export const catalog: {
		id: string;
		name: string;
		icon?: string;
		category: string;
		website: string;
		/** The names of what it brings in. */
		implies: string[];
		/** Up to three traces Prisharp looks for, without values. */
		evidence: { kind: string; text: string }[];
	}[];
}
