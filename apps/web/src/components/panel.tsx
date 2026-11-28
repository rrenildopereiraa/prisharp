import { paths, stroke } from "extension/symbols";
import { useContext, useEffect, useRef, useState } from "react";
import { merge } from "yummacss/merge";
import type { Evidence, Found } from "@/demo";
import { useMorph } from "@/morph";
import { Logo, LogosContext } from "./logo";

type Name = keyof typeof paths;

/** One of the popup's Tabler icons, colored by the text around it. */
function Symbol({ name, className }: { name: Name; className: string }) {
	return (
		<svg
			viewBox={stroke.viewBox}
			fill={stroke.fill}
			stroke={stroke.stroke}
			strokeWidth={stroke["stroke-width"]}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={`${className} us:none`}
		>
			{paths[name].map((d) => (
				<path key={d} d={d} />
			))}
		</svg>
	);
}

// the popup's own classes, so the drawing and the popup look the same
const ICON =
	"d:f ai:c jc:c fs:0 w:8 h:8 bw:0 bg:transparent c:hint c:p h:bg:paper h:c:label fv:os:s fv:ow:2 fv:oc:focus";

const BUTTON =
	"d:f ai:c jc:c g:2 h:9 px:3 bw:1 bc:rim bg:raised bs-o:key c:label ff:mono fs:xs ws:nw c:p h:bg:well a:s:98 tp:a tdu:150 @prm:tp:none fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

const VERSION = "fs:0 py:0 px:1 bw:1 bc:accent/40 c:accent fs:xs lh:4 ws:nw";

// the logos are pictures of the product, not text to select
function Mark({ tech, size }: { tech: Found; size: string }) {
	const files = useContext(LogosContext);
	if (tech.icon in files) {
		// 2px in, as in the popup, so wide logos keep their edges
		return (
			<Logo
				name={tech.icon}
				className={`d:b ${size} p:calc(0.125rem) us:none`}
			/>
		);
	}
	return (
		<span
			aria-hidden="true"
			className={`d:f ai:c jc:c fs:0 ${size} bg:well ff:sans fs:md c:hint us:none`}
		>
			{tech.name[0]}
		</span>
	);
}

function EvidenceItem({ kind, text, value }: Evidence) {
	return (
		<li className="d:f ai:fs g:3 py:2 px:4">
			<Symbol name="check" className="d:b fs:0 w:4 h:4 mt:1 c:accent" />
			<span className="d:f fd:c g:1 fg:1 min-w:0">
				<code className="as:fs py:0 px:1 bg:well ff:mono fs:xs wb:ba">
					{text}
				</code>
				<span className="fs:xs c:hint wb:ba">
					{value === undefined ? kind : `${kind} · ${value}`}
				</span>
			</span>
		</li>
	);
}

/** Copies the technology's evidence, as the popup's button does. */
function CopyEvidence({ tech }: { tech: Found }) {
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1500);
		return () => clearTimeout(timer);
	}, [copied]);

	const text = [
		[tech.name, tech.version].filter(Boolean).join(" "),
		...tech.evidence.map(
			({ kind, text, value }) =>
				`${kind}: ${text}${value === undefined ? "" : ` (${value})`}`,
		),
	].join("\n");

	return (
		<button
			type="button"
			onClick={() => {
				void navigator.clipboard.writeText(text).then(() => setCopied(true));
			}}
			className={merge(BUTTON, "w:100%")}
		>
			<Symbol name="copy" className="d:b fs:0 w:4 h:4" />
			<span>{copied ? "Copied" : "Copy evidence"}</span>
		</button>
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
			<div
				className={`d:f ai:c h:12 bbw:1 bbc:line ${onBack ? "px:2" : "px:4"}`}
			>
				{onBack && (
					<button
						ref={back}
						type="button"
						aria-label="Back to the list"
						onClick={onBack}
						className={merge(ICON, backClasses)}
					>
						<Symbol name="back" className="d:b w:4 h:4" />
					</button>
				)}
				<p
					className={`m:0 fg:1 min-w:0 fs:xs c:hint o:h to:e ws:nw ${onBack ? "px:2" : ""}`}
				>
					{tech.category}
				</p>
			</div>
			<div className="d:f ai:c g:4 p:4 bbw:1 bbc:line">
				<span className="d:f ai:c jc:c fs:0 w:14 h:14 bw:1 bc:line bg:paper">
					<Mark tech={tech} size="w:8 h:8" />
				</span>
				<div className="d:f fd:c g:1 min-w:0">
					<span className="d:f ai:b g:2 min-w:0">
						<p className="m:0 min-w:0 ff:sans fs:xxl fw:400 lh:1 o:h to:e ws:nw">
							{tech.name}
						</p>
						{tech.version && (
							<span aria-label={`Version ${tech.version}`} className={VERSION}>
								{tech.version}
							</span>
						)}
					</span>
					<a
						href={tech.website}
						target="_blank"
						rel="noreferrer"
						aria-label={`Open ${site}`}
						className="d:if ai:c g:1 as:fs max-w:100% fs:xs c:accent td:none h:td:u fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
					>
						<span className="o:h to:e ws:nw">{site}</span>
						<Symbol name="external" className="d:b fs:0 w:3 h:3" />
					</a>
					{brings.length > 0 && (
						<p className="m:0 fs:xs c:hint">Brings in {brings.join(", ")}</p>
					)}
				</div>
			</div>
			<p className="d:f jc:sb m:0 pt:3 pb:1 px:4 fs:xs fw:400 c:hint">
				<span>How Prisharp knows</span>
				<span>{tech.evidence.length}</span>
			</p>
			<ul className="m:0 pt:0 pb:2 px:0 bbw:1 bbc:line">
				{tech.evidence.map((item) => (
					<EvidenceItem key={`${item.kind} ${item.text}`} {...item} />
				))}
			</ul>
			<div className="p:4">
				<CopyEvidence tech={tech} />
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
			className="p:r w:88 max-w:100% max-h:100% oy:auto ob:c bg:raised c:label ff:mono fs:sm bw:1 bc:line bs-o:pop"
		>
			<div ref={content}>
				<Detail tech={tech} all={[]} focus={false} />
			</div>
		</section>
	);
}
