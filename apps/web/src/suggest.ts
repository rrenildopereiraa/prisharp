import { catalog } from "virtual:catalog";
import { hostOf } from "@/address";

export type Suggestion = {
	name: string;
	host: string;
	address: string;
};

const MAX = 6;

export function suggest(input: string, max = MAX): Suggestion[] {
	const query = input
		.trim()
		.toLowerCase()
		.replace(/^[a-z][a-z\d+.-]*:\/\//, "")
		.replace(/^www\./, "")
		.replace(/[/?#].*$/, "");

	if (!query) return [];

	const ranked = catalog.flatMap((tech): (Suggestion & { rank: number })[] => {
		if (!tech.website) return [];
		const host = hostOf(tech.website);
		const name = tech.name.toLowerCase();
		const exact = host === query || name === query;
		const starts = host.startsWith(query) || name.startsWith(query);
		const contains = host.includes(query) || name.includes(query);
		if (!contains) return [];
		return [
			{
				name: tech.name,
				host,
				address: tech.website,
				rank: exact ? 0 : starts ? 1 : 2,
			},
		];
	});

	ranked.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

	const found: Suggestion[] = [];
	const hosts = new Set<string>();
	for (const hit of ranked) {
		if (hosts.has(hit.host)) continue;
		hosts.add(hit.host);
		found.push({ name: hit.name, host: hit.host, address: hit.address });
		if (found.length === max) break;
	}

	return found;
}
