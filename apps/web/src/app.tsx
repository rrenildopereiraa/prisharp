import { useEffect } from "react";
import { Band } from "@/components/band";
import { Footer } from "@/components/footer";
import Threads from "@/components/threads";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Panel } from "@/components/panel";
import { demo } from "@/demo";
import { DarkContext, useDark } from "@/theme";

const STEPS = [
	{
		title: "Add it to Chrome",
		text: "One click from the Chrome Web Store. Edge, Brave, Opera, Vivaldi and Arc take it too.",
	},
	{
		title: "Open any site",
		text: "Prisharp stays out of the way. It reads nothing until you ask.",
	},
	{
		title: "Click the icon",
		text: "See what the page is built with, then open any result for the evidence.",
	},
];

// A and S press the hero's buttons, unless a field has the keys
const KEYS: Record<string, string> = { a: "install", s: "source" };

export function App() {
	const dark = useDark();

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (target.closest("input, textarea, select, [contenteditable]")) return;
			const id = KEYS[event.key.toLowerCase()];
			if (!id) return;
			event.preventDefault();
			document.getElementById(id)?.click();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	return (
		<DarkContext.Provider value={dark}>
			<div className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm s::bg:accent/25 s::c:label">
				<Band>
					<Header />
				</Band>
				<main className="d:f fd:c fg:1 min-h:0">
					<Band grow className="d:f fd:c @lg:fd:r">
						<Hero />
						<div
							data-stage
							className="p:r d:f fg:1 min-h:96 o:h btw:1 btc:line blc:line @lg:fg:0 @lg:fs:0 @lg:w:100 @lg:btw:0 @lg:blw:1"
						>
							<div
								aria-hidden="true"
								className="p:a t:0 l:0 w:100% h:100% us:none"
							>
								<Threads color={dark ? "#8394ff" : "#2b44ff"} angle={60} />
							</div>
							{/* On a phone the panel fills the room the page has left and
							    scrolls inside it, so it never pushes the page taller; on
							    wider screens it sets the stage's height. */}
							<div className="p:a t:0 l:0 d:f ai:c jc:c w:100% h:100% p:4 @md:p:r @md:fg:1 @md:h:auto @lg:p:6">
								<Panel demo={demo} />
							</div>
						</div>
					</Band>
					<Band>
						<Marquee />
					</Band>
					<Band>
						<ol
							aria-label="How it works"
							className="m:0 p:0 sst:none d:g gtc:3"
						>
							{STEPS.map((step, index) => (
								<li
									key={step.title}
									className={`d:f fd:c g:2 py:4 px:3 @md:py:5 @md:px:8 ${index > 0 ? "blw:1 blc:line" : ""}`}
								>
									<h2 className="m:0 ff:mono fs:xs fw:500 @md:fs:sm">
										<span aria-hidden="true">{index + 1}.</span> {step.title}
									</h2>
									{/* On a phone the three sit side by side, titles only */}
									<p className="d:none m:0 fs:xs c:hint lh:5 @md:d:b">
										{step.text}
									</p>
								</li>
							))}
						</ol>
					</Band>
				</main>
				<Band last>
					<Footer />
				</Band>
			</div>
		</DarkContext.Provider>
	);
}
