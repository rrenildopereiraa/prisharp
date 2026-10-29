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
 * renildo.dev, frozen. The site makes no requests of its own.
 */
export const demo: Demo = {
	host: "renildo.dev",
	technologies: [
		{
			id: "nextjs",
			name: "Next.js",
			category: "Framework",
			website: "https://nextjs.org",
			icon: "nextjs",
			implies: ["react"],
			evidence: [
				{ kind: "Global", text: "window.__next_f" },
				{ kind: "Resource", text: "/_next/static/" },
				{ kind: "Header", text: "x-powered-by", value: "Next.js" },
			],
		},
		{
			id: "react",
			name: "React",
			category: "Library",
			website: "https://react.dev",
			icon: "react",
			implies: [],
			evidence: [{ kind: "Script", text: "react-dom's __reactFiber$ key" }],
		},
		{
			id: "yumma-ui",
			name: "Yumma UI",
			category: "Components",
			website: "https://yummacss.com/ui",
			icon: "yumma-ui",
			implies: ["yummacss", "base-ui"],
			evidence: [{ kind: "Found with", text: "Yumma CSS, Base UI" }],
		},
		{
			id: "base-ui",
			name: "Base UI",
			category: "Components",
			website: "https://base-ui.com",
			icon: "base-ui",
			implies: [],
			evidence: [
				{ kind: "Attribute", text: "data-base-ui-*" },
				{ kind: "Script", text: "Base UI's error URL or event helper" },
			],
		},
		{
			id: "yummacss",
			name: "Yumma CSS",
			category: "Styling",
			website: "https://yummacss.com",
			icon: "yummacss",
			implies: [],
			evidence: [
				{ kind: "Stylesheet", text: ".ai\\:c{align-items" },
				{ kind: "Classes", text: "d:f d:g d:if" },
			],
		},
		{
			id: "turbopack",
			name: "Turbopack",
			category: "Build",
			website: "https://turbo.build/pack",
			icon: "turbopack",
			implies: [],
			evidence: [{ kind: "Global", text: "window.TURBOPACK" }],
		},
		{
			id: "vercel",
			name: "Vercel",
			category: "Hosting",
			website: "https://vercel.com",
			icon: "vercel",
			implies: [],
			evidence: [
				{ kind: "Header", text: "x-vercel-id", value: "cdg1::iad1::sgr5p" },
				{ kind: "Header", text: "server", value: "Vercel" },
			],
		},
	],
};
