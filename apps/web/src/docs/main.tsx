import {
	lazy,
	StrictMode,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { Band } from "@/components/band";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TooltipProvider } from "@/components/tooltip";
import { DarkContext, useDark } from "@/theme";
import { Browsers } from "./browsers";
import { How } from "./how";
import { DocLink, follow, GoContext, PAGES, type Page } from "./layout";
import { Permissions } from "./permissions";
import "../styles.css";

// the list carries every technology and logo, so it loads on its own, and
// early, once the page in front of it is drawn
const load = () => import("./technologies");
const Technologies = lazy(() =>
	load().then((module) => ({ default: module.Technologies })),
);

const VIEWS: Record<Page, { lead: string; view: () => ReactNode }> = {
	"/docs/": {
		lead: "Prisharp reads the traces a site leaves in your browser and shows you each one.",
		view: () => <How />,
	},
	"/docs/browsers/": {
		lead: "Chrome and the browsers built on it, and Firefox, on a computer.",
		view: () => <Browsers />,
	},
	"/docs/technologies/": {
		lead: "Everything Prisharp detects. Pick one to see the evidence it looks for.",
		view: () => <Technologies />,
	},
	"/docs/permissions/": {
		lead: "What Prisharp asks your browser for, and why.",
		view: () => <Permissions />,
	},
};

const pageOf = (path: string): Page =>
	PAGES.find((page) => page.href === path || `${page.href}index.html` === path)
		?.href ?? "/docs/";

function Menu({ current }: { current: Page }) {
	const go = useContext(GoContext);
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
								onClick={follow(go, page.href)}
								onPointerEnter={
									page.href === "/docs/technologies/" ? load : undefined
								}
								aria-current={here ? "page" : undefined}
								className={`d:b py:3 px:2 fs:xs td:none ws:nw fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus @sm:px:3 @md:py:2 @md:px:8 ${
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

function Docs() {
	const dark = useDark();
	const [current, setCurrent] = useState(() => pageOf(location.pathname));
	const index = PAGES.findIndex((page) => page.href === current);
	const { title } = PAGES[index];
	const next = PAGES[index + 1];

	const go = useCallback((page: Page) => {
		if (page !== pageOf(location.pathname)) history.pushState(null, "", page);
		setCurrent(page);
		scrollTo({ top: 0 });
	}, []);

	useEffect(() => {
		const back = () => setCurrent(pageOf(location.pathname));
		addEventListener("popstate", back);
		return () => removeEventListener("popstate", back);
	}, []);

	useEffect(() => {
		document.title = `${title} · Prisharp`;
	}, [title]);

	useEffect(() => {
		const early = () => void load();
		if ("requestIdleCallback" in window) requestIdleCallback(early);
		else setTimeout(early, 500);
	}, []);

	return (
		<GoContext.Provider value={go}>
			<DarkContext.Provider value={dark}>
				<div className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm s::bg:accent/25 s::c:label">
					<Band>
						<Header />
					</Band>
					<main className="d:f fd:c fg:1">
						<Band grow className="d:f fd:c @md:fd:r">
							<Menu current={current} />
							<article className="d:f fd:c g:8 fg:1 min-w:0 py:8 px:4 @md:py:12 @md:px:8">
								<header className="d:f fd:c g:3 max-w:160">
									<h1 className="m:0 ff:sans fw:400 fs:4xl @md:fs:5xl lh:1">
										{title}
									</h1>
									<p className="m:0 fs:sm c:hint lh:5">{VIEWS[current].lead}</p>
								</header>
								<Suspense
									fallback={<p className="m:0 fs:xs c:hint">Loading…</p>}
								>
									{VIEWS[current].view()}
								</Suspense>
								{next && (
									<DocLink
										page={next.href}
										className="as:fs fs:xs c:hint td:none h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
									>
										Next: <span className="c:label">{next.title}</span> →
									</DocLink>
								)}
							</article>
						</Band>
					</main>
					<Band last>
						<Footer />
					</Band>
				</div>
			</DarkContext.Provider>
		</GoContext.Provider>
	);
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<TooltipProvider>
			<Docs />
		</TooltipProvider>
	</StrictMode>,
);
