import { paths } from "extension/symbols";
import { useEffect, useRef } from "react";
import { merge } from "yummacss/merge";
import type { Evidence, Found } from "@/demo";
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
	/** Without it, the page has no way back: it stands on its own. */
	onBack?: () => void;
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
		.map((id) => all.find((other) => other.id === id)?.name ?? id)
		.filter(Boolean);
	const site = new URL(tech.website).hostname.replace(/^www\./, "");

	return (
		<div
			onKeyDown={(event) => {
				if (event.key !== "Escape" || !onBack) return;
				event.preventDefault();
				onBack();
			}}
		>
			<div className={`d:f ai:c g:1 py:2 ${onBack ? "px:2" : "px:4 h:12"}`}>
				{onBack && (
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
				)}
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
 * The popup's evidence page for one technology, on its own: what Prisharp
 * looks for to know it is there. It follows the name the heading types.
 */
export function Proof({ tech }: { tech: Found }) {
	const box = useRef<HTMLElement>(null);
	const content = useRef<HTMLDivElement>(null);
	useMorph(box, content, `page:${tech.id}`);
	return (
		<section
			ref={box}
			aria-label={`How Prisharp knows ${tech.name}`}
			aria-live="polite"
			className="p:r w:80 max-w:100% max-h:100% oy:auto ob:c br:lg bg:panel c:panel-ink ff:d fs:sm bw:1 bc:transparent bs-o:lg"
		>
			<div ref={content}>
				<Detail tech={tech} all={[]} focus={false} />
			</div>
		</section>
	);
}
