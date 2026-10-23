import { detect, probes } from "extension/detect";
import { categories, technologies } from "extension/technologies";
import { snapshot } from "./_snapshot";

const asked = probes(technologies);

/** GET /api/detect?url=example.com: the stack behind a page, as JSON. */
export async function GET(request: Request) {
	const input = new URL(request.url).searchParams.get("url")?.trim() ?? "";
	let target: URL;
	try {
		target = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
	} catch {
		return Response.json(
			{ error: "That is not a web address." },
			{ status: 400 },
		);
	}

	try {
		const page = await snapshot(target, asked);
		const found = detect(page, technologies, categories).map((tech) => ({
			id: tech.id,
			name: tech.name,
			version: tech.version,
			category: tech.category,
			website: tech.website,
			icon: tech.icon ?? tech.id,
		}));
		return Response.json(
			{ url: page.url, technologies: found },
			{ headers: { "cache-control": "public, s-maxage=600" } },
		);
	} catch (error) {
		const message =
			error instanceof Error && error.name !== "TimeoutError"
				? error.message
				: "The page took too long to answer.";
		return Response.json({ error: message }, { status: 422 });
	}
}
