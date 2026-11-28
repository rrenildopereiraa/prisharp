import { useContext, useRef } from "react";
import type { Evidence, Found } from "@/demo";
import { useMorph } from "@/morph";
import { Logo, LogosContext } from "./logo";

// the popup's own classes, so the drawing and the popup look the same

const TAG = "py:px px:2";

// the logos are pictures of the product, not text to select
function Mark({ tech, size }: { tech: Found; size: string }) {
	const files = useContext(LogosContext);
	if (tech.icon in files) {
		// 2px in, as in the popup, so wide logos keep their edges
		return (
			<Logo
				name={tech.icon}
				className={`d:b fs:0 ${size} p:calc(0.125rem) us:none`}
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

/** A match on a row of its own: its kind, then what matched, as code. */
function EvidenceItem({ kind, text, value }: Evidence) {
	return (
		<li className="d:f fd:c g:1 py:3 px:1 bbw:1 bbc:line">
			<span className="c:hint wb:ba">
				{value === undefined ? kind : `${kind} · ${value}`}
			</span>
			<code className="as:fs ff:mono fs:xs wb:ba">
				<span className="bg:accent/10 c:accent">{text}</span>
			</code>
		</li>
	);
}

/**
 * The popup's page for one technology: its name, version and category, and
 * what Prisharp found in the page to know it is there.
 */
function Detail({ tech }: { tech: Found }) {
	const site = new URL(tech.website).hostname.replace(/^www\./, "");
	const matches = tech.evidence.length;

	return (
		<div className="pt:5">
			<div className="d:f ai:c g:4 px:5">
				<Mark tech={tech} size="w:8 h:8" />
				<p className="m:0 min-w:0 ff:sans fs:4xl fw:400 lh:1 ls:-1 o:h to:e ws:nw">
					{tech.name}
				</p>
			</div>
			<p className="d:f fw:w ai:c g:2 m:0 mt:4 px:5 fs:xs">
				{tech.version && (
					<span
						aria-label={`Version ${tech.version}`}
						className={`${TAG} bg:accent/10 c:accent`}
					>
						v{tech.version}
					</span>
				)}
				<span className={`${TAG} bw:1 bc:line c:hint`}>{tech.category}</span>
				{tech.implies.map((id) => (
					<span key={id} className={`${TAG} bw:1 bc:line c:hint`}>
						+ {id}
					</span>
				))}
			</p>
			<p className="d:f jc:sb m:0 mt:6 mb:1 px:5 fs:xs c:hint">
				<span>Found in the page</span>
				<span>{matches === 1 ? "1 match" : `${matches} matches`}</span>
			</p>
			<ul className="m:0 mx:5 p:0 btw:1 btc:line fs:xs">
				{tech.evidence.map((item) => (
					<EvidenceItem key={`${item.kind} ${item.text}`} {...item} />
				))}
			</ul>
			<div className="p:5 fs:xs">
				<a
					href={tech.website}
					target="_blank"
					rel="noreferrer"
					className="c:accent td:none h:td:u fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
				>
					{site} ↗
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
			className="p:r w:88 max-w:100% max-h:100% oy:auto ob:c bg:raised c:label ff:mono fs:sm bw:1 bc:line bs-o:pop"
		>
			<div ref={content}>
				<Detail tech={tech} />
			</div>
		</section>
	);
}
