import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Band } from "@/components/band";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TooltipProvider } from "@/components/tooltip";
import { DarkContext, useDark } from "@/theme";
import "../styles.css";

/** The docs' pages, in the order the side menu lists them. */
export const PAGES = [
	{ href: "/docs/", title: "How it works" },
	{ href: "/docs/browsers/", title: "Browsers" },
	{ href: "/docs/technologies/", title: "Technologies" },
	{ href: "/docs/permissions/", title: "Permissions" },
] as const;

type Page = (typeof PAGES)[number]["href"];

/** A link inside the docs' text. */
export const LINK =
	"c:label td:u h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

export function Section({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="d:f fd:c g:3">
			<h2 className="m:0 ff:mono fs:sm fw:500">{title}</h2>
			{children}
		</section>
	);
}

export function Text({ children }: { children: ReactNode }) {
	return <p className="m:0 fs:xs c:hint lh:5">{children}</p>;
}

/** A word as code: a global, a header, a permission. */
export function Code({ children }: { children: ReactNode }) {
	return (
		<code className="px:1 bg:well c:label ff:mono fs:xs ow:bw">{children}</code>
	);
}

/** The docs' pages as a menu: down the side on wider screens, across above. */
function Menu({ current }: { current: Page }) {
	return (
		<nav
			aria-label="Docs"
			className="fs:0 bbw:1 bbc:line @md:w:56 @md:bbw:0 @md:brw:1 @md:brc:line"
		>
			<ul className="m:0 p:0 px:1 sst:none d:f ox:auto @md:fd:c @md:px:0 @md:py:10 @md:p:st @md:t:0">
				{PAGES.map((page) => {
					const here = page.href === current;
					return (
						<li key={page.href} className="fs:0">
							<a
								href={page.href}
								aria-current={here ? "page" : undefined}
								className={`d:b py:3 px:2 fs:xs @sm:px:3 td:none ws:nw fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus @md:py:2 @md:px:8 ${
									here ? "c:accent fw:500" : "c:hint h:c:label"
								}`}
							>
								{page.title}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

/** One page of the docs: its title and lead, under the site's header. */
function Doc({
	current,
	lead,
	children,
}: {
	current: Page;
	lead: ReactNode;
	children: ReactNode;
}) {
	const dark = useDark();
	const index = PAGES.findIndex((page) => page.href === current);
	const next = PAGES[index + 1];
	return (
		<DarkContext.Provider value={dark}>
			<div className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm s::bg:accent/25 s::c:label">
				<Band>
					<Header />
				</Band>
				<main className="d:f fd:c fg:1">
					<Band grow className="d:f fd:c @md:fd:r">
						<Menu current={current} />
						<article className="d:f fd:c g:8 fg:1 min-w:0 max-w:180 py:10 px:4 @md:py:14 @md:px:8">
							<header className="d:f fd:c g:3">
								<h1 className="m:0 ff:sans fw:400 fs:4xl @md:fs:5xl lh:1">
									{PAGES[index].title}
								</h1>
								<Text>{lead}</Text>
							</header>
							{children}
							{next && (
								<a
									href={next.href}
									className="as:fs fs:xs c:hint td:none h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
								>
									Next: <span className="c:label">{next.title}</span> →
								</a>
							)}
						</article>
					</Band>
				</main>
				<Band last>
					<Footer />
				</Band>
			</div>
		</DarkContext.Provider>
	);
}

/** Draws a docs page into the HTML entry's root. */
export function render(current: Page, lead: ReactNode, children: ReactNode) {
	createRoot(document.getElementById("root") as HTMLElement).render(
		<StrictMode>
			<TooltipProvider>
				<Doc current={current} lead={lead}>
					{children}
				</Doc>
			</TooltipProvider>
		</StrictMode>,
	);
}
