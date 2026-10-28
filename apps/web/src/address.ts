import { z } from "zod/mini";

const address = z.url({
	protocol: z.regexes.httpProtocol,
	hostname: z.regexes.domain,
});

export function toAddress(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;
	const parsed = address.safeParse(
		/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
	);
	return parsed.success ? parsed.data : null;
}
