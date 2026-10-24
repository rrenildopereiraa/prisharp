import { type ReactNode, useEffect } from "react";
import { Footer } from "@/components/footer";
import GradientASCII from "@/components/gradient-ascii";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Panel } from "@/components/panel";
import { useLookup } from "@/lookup";
import { DarkContext, useDark } from "@/theme";

/** A small cross where two hairlines of the frame meet. */
function Cross({ side }: { side: "l" | "r" }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 8 8"
			className={`d:none p:a b:-1 w:2 h:2 c:rim @md:d:b ${side === "l" ? "l:-1" : "r:-1"}`}
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

	// the ASCII field rises from the bottom of the band, from the paper into
	// the ink, behind both columns
	const ramp = dark
		? ["#151412", "#2f2c27", "#57524a", "#a8a091"]
		: ["#f5f3ee", "#ddd8cc", "#948c7c", "#5c564b"];

	return (
		<DarkContext.Provider value={dark}>
			<div className="d:f fd:c h:dvh bg:paper c:label ff:mono fs:sm @md:h:auto @md:min-h:dvh">
				<Band>
					<Header />
				</Band>
				<main className="d:f fd:c fg:1 min-h:0">
					<Band grow className="d:f fd:c @lg:fd:r">
						<div
							aria-hidden="true"
							className="p:a t:0 l:0 w:100% h:100% us:none"
						>
							<GradientASCII
								colors={ramp}
								lightMode={!dark}
								shape="rise"
								cellSize={14}
								fontFamily='"Geist Mono Variable", ui-monospace, monospace'
								glow={0}
								gradientOpacity={0}
								grain={0.04}
								flicker={0.1}
								speed={0.6}
								clickEffect="none"
							/>
						</div>
						<Hero lookup={lookup} onLookup={(address) => void run(address)} />
						<div className="p:r d:f ai:c jc:c fg:1 min-h:0 o:h p:4 btw:1 btc:line @md:min-h:96 @lg:fg:0 @lg:fs:0 @lg:w:100 @lg:btw:0 @lg:blw:1 @lg:blc:line @lg:p:6">
							<Panel lookup={lookup} />
						</div>
					</Band>
					<Band>
						<Marquee />
					</Band>
					<div data-facts>
						<Band className="d:none @md:d:g @md:gtc:3">
							{FACTS.map((fact, index) => (
								<div
									key={fact.title}
									className={`d:f fd:c g:2 py:5 px:8 ${index > 0 ? "blw:1 blc:line" : ""}`}
								>
									<h2 className="m:0 ff:serif fs:lg fw:400">{fact.title}</h2>
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
