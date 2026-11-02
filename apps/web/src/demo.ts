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

export interface Demo {
	host: string;
	technologies: Found[];
}

/**
 * The result the panel shows: a real run of the extension's detection over
 * supabase.com, frozen. The site makes no requests of its own.
 */
export const demo: Demo = {
	host: "supabase.com",
	technologies: [
		{
			id: "nextjs",
			name: "Next.js",
			version: "16.4.3",
			category: "Framework",
			website: "https://nextjs.org",
			icon: "nextjs",
			implies: ["react"],
			evidence: [
				{ kind: "Global", text: "window.next.version", value: "16.4.3" },
				{ kind: "Global", text: "window.__next_f" },
				{ kind: "Resource", text: "/_next/static/" },
			],
		},
		{
			id: "react",
			name: "React",
			category: "Library",
			website: "https://react.dev",
			icon: "react",
			implies: [],
			evidence: [{ kind: "Element", text: "__reactFiber$" }],
		},
		{
			id: "tailwindcss",
			name: "Tailwind CSS",
			version: "4.2.4",
			category: "Styling",
			website: "https://tailwindcss.com",
			icon: "tailwindcss",
			implies: [],
			evidence: [
				{ kind: "Stylesheet", text: "tailwindcss v4.2.4" },
				{ kind: "Stylesheet", text: "@property --tw-" },
			],
		},
		{
			id: "radix",
			name: "Radix UI",
			category: "Components",
			website: "https://www.radix-ui.com",
			icon: "radix",
			implies: [],
			evidence: [
				{ kind: "Element", text: "[data-radix-collection-item]" },
				{ kind: "Element", text: "[id^='radix-']" },
			],
		},
		{
			id: "lucide",
			name: "Lucide",
			category: "Icons",
			website: "https://lucide.dev",
			icon: "lucide",
			implies: [],
			evidence: [{ kind: "Element", text: "svg.lucide" }],
		},
		{
			id: "vercel",
			name: "Vercel",
			category: "Hosting",
			website: "https://vercel.com",
			icon: "vercel",
			implies: [],
			evidence: [
				{
					kind: "Header",
					text: "x-vercel-id",
					value: "cdg1::8rwrf-1793653548447",
				},
				{ kind: "Header", text: "server", value: "Vercel" },
			],
		},
	],
};
