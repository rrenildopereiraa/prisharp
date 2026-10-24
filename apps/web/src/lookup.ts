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
	| { state: "loading"; host: string }
	| { state: "done"; host: string; technologies: Found[] }
	| { state: "error"; host: string; message: string };

const hostOf = (address: string) =>
	address
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./, "")
		.split(/[/?#]/)[0];

/**
 * The extension's detection, run on the server for a site you name. Starts
 * with `initial` so the panel shows a real result before anyone types.
 */
export function useLookup(initial: string) {
	const [lookup, setLookup] = useState<Lookup>({
		state: "loading",
		host: initial,
	});
	// only the latest request may answer
	const latest = useRef(0);

	const run = useCallback(async (address: string) => {
		const id = ++latest.current;
		const host = hostOf(address);
		setLookup({ state: "loading", host });
		try {
			const response = await fetch(
				`/api/detect?url=${encodeURIComponent(address)}`,
			);
			const body = await response.json();
			if (!response.ok) throw new Error(body.error);
			if (id !== latest.current) return;
			setLookup({
				state: "done",
				host: hostOf(new URL(body.url).hostname),
				technologies: body.technologies,
			});
		} catch (error) {
			if (id !== latest.current) return;
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
		void run(initial);
	}, [initial, run]);

	return { lookup, run };
}
