import { z } from "zod/mini";

// A site address: an http(s) URL, or a host and path without one. The host
// must be a domain, which turns away what people paste by mistake, like the
// same scheme twice.
const address = z.url({
	protocol: z.regexes.httpProtocol,
	hostname: z.regexes.domain,
});

/** The address to scan, or null when what was typed is not a web address. */
export function toAddress(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;
	const parsed = address.safeParse(
		/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
	);
	return parsed.success ? parsed.data : null;
}
