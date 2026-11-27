import { useHotkey } from "@tanstack/react-hotkeys";
import { useState } from "react";
import { FIREFOX, UNSUPPORTED } from "@/browser";
import { Band } from "@/components/band";
import { Footer } from "@/components/footer";
import Threads from "@/components/threads";
import { Header } from "@/components/header";
import { FIRST, Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { typed } from "virtual:catalog";
import { Proof } from "@/components/panel";
import type { Found } from "@/demo";
import { DarkContext, useDark } from "@/theme";

const STEPS = [
	UNSUPPORTED
		? {
				title: "Open it on a computer",
				text: "Prisharp is an extension for Chrome and Firefox on a computer. Phones, tablets and Safari can't run it.",
			}
		: FIREFOX
			? {
					title: "Add it to Firefox",
					text: "Prisharp isn't on Firefox Add-ons yet. Until it is, download the .zip and load it from about:debugging.",
				}
			: {
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

// A and S press the hero's buttons; Shift+A, the dev version's warning, is the
// hero's own. Typing in a field never triggers them, and neither does an open
// dialog, which covers the buttons.
const press = (id: string) => () => {
	if (document.querySelector('[role="dialog"][data-open]')) return;
	document.getElementById(id)?.click();
};

/** A typed name's entry, in the shape the popup's evidence page reads. */
const found = (name: string): Found => {
	const tech = typed.find((entry) => entry.name === name) ?? typed[0];
	return { ...tech, icon: tech.icon ?? tech.id };
};

export function App() {
	const dark = useDark();
	// the evidence follows the name the heading has typed
	const [named, setNamed] = useState(FIRST);
	const proof = found(named);

	useHotkey("A", press("install"));
	useHotkey("S", press("source"));

	return (
		<DarkContext.Provider value={dark}>
			<div
				data-page
				className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm s::bg:accent/25 s::c:label"
			>
				<Band>
					<Header />
				</Band>
				<main className="d:f fd:c fg:1 min-h:0">
					<Band grow className="d:f fd:c @lg:fd:r">
						<Hero onName={setNamed} />
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
								<Proof tech={proof} />
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
