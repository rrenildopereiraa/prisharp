import { paths } from "extension/symbols";
import { useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import type { Demo, Evidence, Found } from "@/demo";
import { useMorph } from "@/morph";
import { hasLogo, Logo } from "./logo";

type Name = keyof typeof paths;

/** One of the popup's Material Symbols, colored by the text around it. */
function Symbol({ name, className }: { name: Name; className: string }) {
	return (
		<svg
			viewBox="0 -960 960 960"
			fill="currentColor"
			aria-hidden="true"
			className={`${className} us:none`}
		>
			<path d={paths[name]} />
		</svg>
	);
}

const ROW =
	"d:f ai:c g:3 w:100% h:10 px:4 bw:0 bg:transparent c:panel-ink ff:d fs:sm ta:l td:none c:p h:bg:panel-hover fv:os:s fv:ow:2 fv:oo:-2 fv:oc:panel-focus";

const RULE = "m:0 h:px bw:0 bg:panel-line";

// what the demo draws in place of real focus and a real press, so it never
// takes focus from the page
const RING = "os:s ow:2 oo:-2 oc:panel-focus bg:panel-hover";
const PRESSED = "bg:panel-line";

const wait = (ms: number, signal: AbortSignal) =>
	new Promise<void>((done, fail) => {
		const timer = setTimeout(done, ms);
		signal.addEventListener("abort", () => {
			clearTimeout(timer);
			fail(signal.reason);
		});
	});

const label = (tech: Found) =>
	[tech.name, tech.version].filter(Boolean).join(" ");

// the logos are pictures of the product, not text to select
function Mark({ tech, size }: { tech: Found; size: string }) {
	if (hasLogo(tech.icon)) {
		// 2px in, as in the popup, so wide logos keep their edges
		return (
			<Logo
				name={tech.icon}
				className={`d:b ${size} p:calc(0.125rem) br:sm us:none`}
			/>
		);
	}
	return (
		<span
			aria-hidden="true"
			className={`d:f ai:c jc:c fs:0 ${size} br:sm bg:panel-well fs:xs fw:600 c:panel-muted us:none`}
		>
			{tech.name[0]}
		</span>
	);
}

function EvidenceItem({ kind, text, value }: Evidence) {
	return (
		<li className="d:f ai:fs g:2 py:2 px:4">
			<Symbol name="check" className="d:b fs:0 w:4 h:4 mt:1 c:panel-ok" />
			<span className="d:f fd:c g:1 fg:1 min-w:0">
				<code className="as:fs py:0 px:1 br:sm bg:panel-well ff:m fs:xs wb:ba">
					{text}
				</code>
				<span className="fs:xs c:panel-muted wb:ba">
					{value === undefined ? kind : `${kind} · ${value}`}
				</span>
			</span>
		</li>
	);
}

function Detail({
	tech,
	all,
	onBack,
	focus,
	backClasses = "",
}: {
	tech: Found;
	all: Found[];
	onBack: () => void;
	/** Moves focus to Back on open: only when a person opened it. */
	focus: boolean;
	/** The demo's ring or press on Back. */
	backClasses?: string;
}) {
	const back = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (focus) back.current?.focus();
	}, [focus]);

	const brings = tech.implies
		.map((id) => all.find((other) => other.id === id)?.name)
		.filter(Boolean);
	const site = new URL(tech.website).hostname.replace(/^www\./, "");

	return (
		<div
			onKeyDown={(event) => {
				if (event.key !== "Escape") return;
				event.preventDefault();
				onBack();
			}}
		>
			<div className="d:f ai:c g:1 py:2 px:2">
				<button
					ref={back}
					type="button"
					aria-label="Back to the list"
					onClick={onBack}
					className={merge(
						"d:f ai:c jc:c fs:0 w:8 h:8 br:9999 bw:0 bg:transparent c:panel-muted h:bg:panel-hover c:p fv:os:s fv:ow:2 fv:oc:panel-focus",
						backClasses,
					)}
				>
					<Symbol name="arrow_back" className="d:b w:5 h:5" />
				</button>
				<p className="m:0 fg:1 min-w:0 fs:md fw:400 o:h to:e ws:nw">
					{tech.name}
				</p>
			</div>
			<hr className={RULE} />
			<div className="d:f ai:c g:3 p:4">
				<span className="d:f ai:c jc:c fs:0 w:11 h:11 br:lg bg:panel-well">
					<Mark tech={tech} size="w:7 h:7" />
				</span>
				<div className="min-w:0">
					<p className="m:0">
						{tech.version ? `Version ${tech.version}` : tech.category}
					</p>
					<p className="m:0 mt:1 fs:xs c:panel-muted">
						{[
							tech.version && tech.category,
							brings.length > 0 && `brings in ${brings.join(", ")}`,
						]
							.filter(Boolean)
							.join(" · ")}
					</p>
				</div>
			</div>
			<hr className={RULE} />
			<p className="m:0 pt:3 pb:1 px:4 fs:xs fw:400 c:panel-muted">
				How Prisharp knows
			</p>
			<ul className="m:0 pt:0 pb:2 px:0">
				{tech.evidence.map((item) => (
					<EvidenceItem key={`${item.kind} ${item.text}`} {...item} />
				))}
			</ul>
			<hr className={RULE} />
			<div className="py:1">
				<a href={tech.website} target="_blank" rel="noreferrer" className={ROW}>
					<Symbol name="language" className="d:b fs:0 w:5 h:5 c:panel-muted" />
					<span className="fg:1 min-w:0 o:h to:e ws:nw">Open {site}</span>
					<Symbol
						name="open_in_new"
						className="d:b fs:0 w:4 h:4 c:panel-muted"
					/>
				</a>
			</div>
		</div>
	);
}

/**
 * The extension's popup, drawn on the page with a result: the list, and a page
 * of evidence for each technology, as in Chrome.
 *
 * It plays itself in a loop: a row takes focus, opens, goes back, and Tab
 * moves on to the next. A pointer or focus inside holds it, and leaving lets
 * it carry on from where it is. Under reduced motion it stays still.
 */
export function Panel({ demo }: { demo: Demo }) {
	const [open, setOpen] = useState<string | null>(null);
	const [opened, setOpened] = useState(false);
	const [hold, setHold] = useState(false);
	const [ring, setRing] = useState<string | null>(null);
	const [pressed, setPressed] = useState<string | null>(null);
	const rows = useRef<Map<string, HTMLButtonElement>>(new Map());
	const pointer = useRef(false);
	const focused = useRef(false);
	const current = useRef(open);
	current.current = open;
	// where the loop is, to carry on from after a hold
	const next = useRef(0);

	const all = demo.technologies;
	const tech = all.find((item) => item.id === open);
	const live = !hold && all.length > 1;

	useEffect(() => {
		if (!live) return;
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const controller = new AbortController();
		const { signal } = controller;
		const shown = all.slice(0, 5).map((item) => item.id);

		const press = async (id: string) => {
			setPressed(id);
			await wait(160, signal);
			setPressed(null);
		};
		const back = async (id: string) => {
			setRing("back");
			await wait(700, signal);
			await press("back");
			setOpen(null);
			setRing(id);
			await wait(800, signal);
		};

		const play = async () => {
			let index = next.current % shown.length;
			const left = current.current;
			if (left) {
				// held on a page: go back from it first
				index = Math.max(0, shown.indexOf(left));
				await wait(400, signal);
				await back(left);
				index = (index + 1) % shown.length;
				setRing(shown[index]);
				await wait(900, signal);
			} else {
				setRing(shown[index]);
				await wait(1200, signal);
			}
			for (;;) {
				const id = shown[index];
				next.current = index;
				// Enter: the row presses in and opens
				await press(id);
				setRing(null);
				setOpened(false);
				setOpen(id);
				await wait(3000, signal);
				await back(id);
				// Tab, to the next row
				index = (index + 1) % shown.length;
				next.current = index;
				setRing(shown[index]);
				await wait(900, signal);
			}
		};
		play().catch(() => {});
		return () => {
			controller.abort();
			setRing(null);
			setPressed(null);
		};
	}, [live, all]);

	const holdFor = () => setHold(pointer.current || focused.current);

	const box = useRef<HTMLElement>(null);
	const content = useRef<HTMLDivElement>(null);
	useMorph(box, content, tech ? `page:${tech.id}` : "list");

	const status =
		all.length === 0
			? "No known technology found on this page."
			: all.length === 1
				? "Built with 1 technology"
				: `Built with ${all.length} technologies`;

	return (
		<section
			ref={box}
			aria-label="Result"
			onPointerEnter={() => {
				pointer.current = true;
				holdFor();
			}}
			onPointerLeave={() => {
				pointer.current = false;
				holdFor();
			}}
			onFocus={() => {
				focused.current = true;
				holdFor();
			}}
			onBlur={(event) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				focused.current = false;
				holdFor();
			}}
			className="p:r w:80 max-w:100% max-h:100% oy:auto ob:c br:lg bg:panel c:panel-ink ff:d fs:sm bw:1 bc:transparent bs-o:lg"
		>
			<div ref={content}>
				{tech ? (
					<Detail
						tech={tech}
						all={all}
						focus={opened}
						backClasses={
							pressed === "back" ? PRESSED : ring === "back" ? RING : ""
						}
						onBack={() => {
							setOpen(null);
							requestAnimationFrame(() => rows.current.get(tech.id)?.focus());
						}}
					/>
				) : (
					<>
						<div className="pt:4 pb:3 px:4">
							<p className="m:0 fs:md fw:400 o:h to:e ws:nw">{demo.host}</p>
							<p className="m:0 mt:1 fs:xs c:panel-muted">{status}</p>
						</div>
						{all.length > 0 && (
							<>
								<hr className={RULE} />
								<ul className="m:0 py:1 px:0">
									{all.map((item) => (
										<li key={item.id} className="d:b">
											<button
												ref={(element) => {
													if (element) rows.current.set(item.id, element);
												}}
												type="button"
												aria-label={`${label(item)} ${item.category}. Show the evidence`}
												onClick={() => {
													setOpened(true);
													setOpen(item.id);
												}}
												className={merge(
													ROW,
													pressed === item.id
														? PRESSED
														: ring === item.id
															? RING
															: "",
												)}
											>
												<Mark tech={item} size="w:5 h:5" />
												<span className="fg:1 min-w:0 o:h to:e ws:nw">
													{item.name}
												</span>{" "}
												<span className="fs:xs c:panel-muted ws:nw fvn:tn">
													{item.version ?? item.category}
												</span>
												<Symbol
													name="chevron_right"
													className="d:b fs:0 w:4 h:4 c:panel-muted"
												/>
											</button>
										</li>
									))}
								</ul>
							</>
						)}
					</>
				)}
			</div>
		</section>
	);
}
