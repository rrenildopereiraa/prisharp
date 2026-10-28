import { type ReactNode, useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import Threads from "@/components/threads";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Panel } from "@/components/panel";
import { useLookup } from "@/lookup";
import { DarkContext, useDark } from "@/theme";

/**
 * A small cross where two hairlines of the frame meet. It sits just outside
 * the column, so it shows only once the column has room on either side.
 */
function Cross({ side }: { side: "l" | "r" }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 8 8"
			className={`d:none p:a b:-1 w:2 h:2 c:rim @xl:d:b ${side === "l" ? "l:-1" : "r:-1"}`}
		>
			<path d="M4 0v8M0 4h8" stroke="currentColor" strokeWidth="1" />
		</svg>
	);
}

/**
 * One band of the page: a hairline across the whole width under it, and on
 * wider screens two more down the sides of the column, crossed at the corners.
 */
function Band({
	children,
	className = "",
	grow = false,
	last = false,
}: {
	children: ReactNode;
	className?: string;
	/** Takes the height left over, so the page fits the screen. */
	grow?: boolean;
	/** The bottom band: no hairline under it. */
	last?: boolean;
}) {
	return (
		<div
			className={`${last ? "" : "bbw:1 bbc:line"} ${grow ? "d:f fd:c fg:1 min-h:0" : ""}`}
		>
			<div
				className={`p:r w:100% max-w:260 mx:auto @md:blw:1 @md:brw:1 @md:blc:line @md:brc:line ${grow ? "fg:1 min-h:0" : ""} ${className}`}
			>
				{children}
				{!last && <Cross side="l" />}
				{!last && <Cross side="r" />}
			</div>
		</div>
	);
}

const FACTS = [
	{
		title: "Shows its work",
		text: "Open any result to see the script, global or tag that gave it away.",
	},
	{
		title: "Stays on your device",
		text: "The page is read inside your browser. No account, no tracking.",
	},
	{
		title: "Open source",
		text: "MIT licensed. Teaching it a new technology takes one entry in one file.",
	},
];

// D and S press the hero's buttons, unless a field has the keys
const KEYS: Record<string, string> = { d: "download", s: "source" };

export function App() {
	const dark = useDark();
	const { lookup, run } = useLookup("renildo.dev");
	const [asked, setAsked] = useState(0);

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
			<div className="d:f fd:c min-h:dvh bg:paper c:label ff:mono fs:sm">
				<Band>
					<Header />
				</Band>
				<main className="d:f fd:c fg:1 min-h:0">
					<Band grow className="d:f fd:c @lg:fd:r">
						<Hero
							lookup={lookup}
							onLookup={(address) => {
								setAsked((count) => count + 1);
								void run(address);
							}}
						/>
						<div
							data-stage
							className="p:r d:f fg:1 min-h:48 o:h btw:1 btc:line blc:line @md:min-h:96 @lg:fg:0 @lg:fs:0 @lg:w:100 @lg:btw:0 @lg:blw:1"
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
								<Panel lookup={lookup} />
							</div>
						</div>
					</Band>
					<Band>
						<Marquee asked={asked} />
					</Band>
					<div data-facts>
						<Band className="d:none @md:d:g @md:gtc:3">
							{FACTS.map((fact, index) => (
								<div
									key={fact.title}
									className={`d:f fd:c g:2 py:5 px:8 ${index > 0 ? "blw:1 blc:line" : ""}`}
								>
									<h2 className="m:0 ff:sans fs:md fw:600">{fact.title}</h2>
									<p className="m:0 fs:xs c:hint lh:5">{fact.text}</p>
								</div>
							))}
						</Band>
					</div>
				</main>
				<Band last>
					<Footer />
				</Band>
			</div>
		</DarkContext.Provider>
	);
}
