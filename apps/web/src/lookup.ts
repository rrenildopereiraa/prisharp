import { useCallback, useEffect, useRef, useState } from "react";
import { hostOf, toAddress } from "@/address";
import { rememberSite } from "@/share";

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
	| { state: "loading"; host: string; address: string; asked: boolean }
	| { state: "done"; host: string; address: string; technologies: Found[] }
	| { state: "error"; host: string; address: string; message: string };

const TRIES = 3;

/**
 * The extension's detection, run on the server for a site you name. Starts
 * with `initial` so the panel shows a real result before anyone types.
 */
export function useLookup(initial: string) {
	const [lookup, setLookup] = useState<Lookup>(() => ({
		state: "loading",
		host: initial,
		address: toAddress(initial) ?? initial,
		asked: false,
	}));
	// only the latest request may answer
	const latest = useRef(0);
	const failures = useRef(new Map<string, number>());
	// the address a request is out for, so a second click asks nothing new
	const flight = useRef<string | null>(null);
	// what the panel is showing now, read from a handler that may be stale
	const shown = useRef(lookup);

	useEffect(() => {
		shown.current = lookup;
	}, [lookup]);

	const load = useCallback(
		async (key: string, asked: boolean, fresh: boolean) => {
			const id = ++latest.current;
			flight.current = key;
			const host = hostOf(key);
			try {
				if ((failures.current.get(key) ?? 0) >= TRIES) {
					setLookup({
						state: "error",
						host,
						address: key,
						message: "Failed to fetch. Try again later.",
					});
					return;
				}
				setLookup({ state: "loading", host, address: key, asked });
				const response = await fetch(
					`/api/detect?url=${encodeURIComponent(key)}${fresh ? "&fresh=1" : ""}`,
				);
				const body = await response.json();
				if (!response.ok) throw new Error(body.error);
				if (id !== latest.current) return;
				failures.current.delete(key);
				setLookup({
					state: "done",
					host: hostOf(new URL(body.url).hostname),
					address: key,
					technologies: body.technologies,
				});
			} catch (error) {
				if (id !== latest.current) return;
				failures.current.set(key, (failures.current.get(key) ?? 0) + 1);
				setLookup({
					state: "error",
					host,
					address: key,
					message:
						error instanceof Error && error.message
							? error.message
							: "Unable to reach that site. Check the address and try again.",
				});
			} finally {
				if (id === latest.current) flight.current = null;
			}
		},
		[],
	);

	const run = useCallback(
		(address: string, asked = true) => {
			const key = toAddress(address) ?? address;
			if (flight.current === key) return;
			if (asked) rememberSite(key);
			const now = shown.current;
			void load(key, asked, now.state === "done" && now.address === key);
		},
		[load],
	);

	useEffect(() => {
		run(initial, false);
	}, [initial, run]);

	return { lookup, run };
}
