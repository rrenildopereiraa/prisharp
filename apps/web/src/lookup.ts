import { useCallback, useEffect, useRef, useState } from "react";

export interface Evidence {
	kind: string;
	text: string;
	value?: string;
}

export interface Found {
	id: string;
	name: string;
	version?: string;
	category: string;
	website: string;
	icon: string;
	implies: string[];
	evidence: Evidence[];
}

export type Lookup =
	// `asked`: someone looked it up, rather than the page on its first load
	| { state: "loading"; host: string; asked: boolean }
	| { state: "done"; host: string; technologies: Found[] }
	| { state: "error"; host: string; message: string };

const hostOf = (address: string) =>
	address
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./, "")
		.split(/[/?#]/)[0];

const TRIES = 3;

/**
 * The extension's detection, run on the server for a site you name. Starts
 * with `initial` so the panel shows a real result before anyone types.
 */
export function useLookup(initial: string) {
	const [lookup, setLookup] = useState<Lookup>({
		state: "loading",
		host: initial,
		asked: false,
	});
	// only the latest request may answer
	const latest = useRef(0);
	const failures = useRef(new Map<string, number>());

	const run = useCallback(async (address: string, asked = true) => {
		const id = ++latest.current;
		const host = hostOf(address);
		if ((failures.current.get(address) ?? 0) >= TRIES) {
			setLookup({
				state: "error",
				host,
				message: "Failed to fetch. Try again later.",
			});
			return;
		}
		setLookup({ state: "loading", host, asked });
		try {
			const response = await fetch(
				`/api/detect?url=${encodeURIComponent(address)}`,
			);
			const body = await response.json();
			if (!response.ok) throw new Error(body.error);
			if (id !== latest.current) return;
			failures.current.delete(address);
			setLookup({
				state: "done",
				host: hostOf(new URL(body.url).hostname),
				technologies: body.technologies,
			});
		} catch (error) {
			if (id !== latest.current) return;
			failures.current.set(address, (failures.current.get(address) ?? 0) + 1);
			setLookup({
				state: "error",
				host,
				message:
					error instanceof Error && error.message
						? error.message
						: "Unable to reach that site. Check the address and try again.",
			});
		}
	}, []);

	useEffect(() => {
		void run(initial, false);
	}, [initial, run]);

	return { lookup, run };
}
