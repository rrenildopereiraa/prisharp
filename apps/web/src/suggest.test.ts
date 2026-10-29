import { expect, it } from "vite-plus/test";
import { suggest } from "./suggest";

const hosts = (query: string) => suggest(query).map((hit) => hit.host);

it("finds a site by the start of its name", () => {
	expect(hosts("tailwind")[0]).toBe("tailwindcss.com");
	expect(hosts("next")[0]).toBe("nextjs.org");
	expect(hosts("TanStack")).toContain("tanstack.com");
});

it("finds a site by its host", () => {
	expect(hosts("nextjs.org")[0]).toBe("nextjs.org");
	expect(hosts("tailwindcss.com")[0]).toBe("tailwindcss.com");
	expect(hosts("https://nextjs.org/docs")[0]).toBe("nextjs.org");
	expect(hosts("www.nextjs.org")[0]).toBe("nextjs.org");
});

it("returns nothing without a query", () => {
	expect(suggest("")).toEqual([]);
	expect(suggest("   ")).toEqual([]);
	expect(suggest("no-such-technology-anywhere")).toEqual([]);
});

it("stops at six, with an exact name first", () => {
	const hits = suggest("a");
	expect(hits.length).toBe(6);
	expect(new Set(hits.map((hit) => hit.host)).size).toBe(6);
});
