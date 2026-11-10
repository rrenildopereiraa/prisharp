import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Band } from "@/components/band";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TooltipProvider } from "@/components/tooltip";
import { REPO } from "@/links";
import "./styles.css";

const UPDATED = "November 10, 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="d:f fd:c g:3">
			<h2 className="m:0 ff:mono fs:sm fw:500">{title}</h2>
			{children}
		</section>
	);
}

function Text({ children }: { children: ReactNode }) {
	return <p className="m:0 fs:xs c:hint lh:5">{children}</p>;
}

function Privacy() {
	return (
		<div className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm s::bg:accent/25 s::c:label">
			<Band>
				<Header />
			</Band>
			<main className="d:f fd:c fg:1">
				<Band grow>
					<article className="d:f fd:c g:8 max-w:160 py:10 px:4 @md:py:14 @md:px:8">
						<header className="d:f fd:c g:3">
							<h1 className="m:0 ff:sans fw:400 fs:4xl @md:fs:5xl lh:1">
								Privacy
							</h1>
							<Text>Last updated {UPDATED}</Text>
						</header>

						<Text>
							Prisharp is a browser extension that shows which frameworks,
							libraries and hosts a page uses. It has no account, no analytics
							and no server of its own. What it finds stays in your browser.
						</Text>

						<Section title="When it runs">
							<Text>
								Only when you click its icon, and only on the tab you are
								looking at. It does not run in the background or on other tabs.
							</Text>
						</Section>

						<Section title="What it reads">
							<Text>
								On that tab it reads the page's scripts, stylesheets, meta tags
								and the global variables frameworks leave behind. To read
								response headers and file contents, it requests the page and its
								scripts and stylesheets again, from the same servers the page
								already loads them from, usually straight from your browser's
								cache.
							</Text>
						</Section>

						<Section title="What leaves your browser">
							<Text>
								One thing: to show a site's icon in the popup, Prisharp asks
								Google's favicon service for it, which tells Google the site's
								domain name. Nothing else is sent anywhere. Results are not
								stored, and they are gone when the popup closes.
							</Text>
						</Section>

						<Section title="What it does not do">
							<Text>
								It does not collect personal information, browsing history, form
								data or passwords. It does not sell or share data, because it
								has none to share.
							</Text>
						</Section>

						<Section title="This website">
							<Text>
								prisharp.com has no analytics or tracking cookies. It is hosted
								on Vercel, which keeps standard server logs.
							</Text>
						</Section>

						<Section title="Questions">
							<Text>
								Prisharp is open source, so you can read exactly what it does.
								Ask anything on{" "}
								<a
									href={`${REPO}/issues`}
									className="c:label td:u h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
								>
									GitHub
								</a>
								.
							</Text>
						</Section>
					</article>
				</Band>
			</main>
			<Band last>
				<Footer />
			</Band>
		</div>
	);
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<TooltipProvider>
			<Privacy />
		</TooltipProvider>
	</StrictMode>,
);
