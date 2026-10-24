import { technologies } from "extension/technologies";
import { useState } from "react";
import { paths, silhouettes } from "@/marks";

// the extension's logo files, for the marks Simple Icons lacks
const files = import.meta.glob<string>("../../../extension/icons/tech/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});

type Mark = { id: string; name: string } & ({ path: string } | { url: string });

interface Technology {
	id: string;
	name: string;
	icon?: string;
}

const marks: Mark[] = (technologies as Technology[]).flatMap((tech): Mark[] => {
	const name = tech.icon ?? tech.id;
	if (tech.id in paths)
		return [{ id: tech.id, name: tech.name, path: paths[tech.id] }];
	if (silhouettes.includes(name)) {
		const url = files[`../../../extension/icons/tech/${name}.svg`];
		if (url) return [{ id: tech.id, name: tech.name, url }];
	}
	return [];
});

function Item({ mark }: { mark: Mark }) {
	const size = "d:b w:6 h:6 @md:w:7 @md:h:7";
	return (
		<li
			role="img"
			aria-label={mark.name}
			title={mark.name}
			className="d:f ai:c jc:c fs:0 h:10 px:5 @md:px:6"
		>
			{"path" in mark ? (
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
					className={size}
				>
					<path d={mark.path} />
				</svg>
			) : (
				<span
					aria-hidden="true"
					className={`${size} bg:hint`}
					style={{
						mask: `url(${mark.url}) center / contain no-repeat`,
						WebkitMask: `url(${mark.url}) center / contain no-repeat`,
					}}
				/>
			)}
		</li>
	);
}

/**
 * The technologies Prisharp detects, scrolling past in the page's ink. Under
 * reduced motion it stands still, and a button pauses it for anyone else.
 */
export function Marquee() {
	const [paused, setPaused] = useState(false);
	return (
		<section
			aria-labelledby="detects"
			className="d:f fd:c g:2 py:3 @md:fd:r @md:ai:c @md:g:5 @md:py:0 @md:h:18"
		>
			<h2
				id="detects"
				className="m:0 fs:0 px:4 fs:xs fw:400 c:hint lh:5 @md:pl:8 @md:pr:0 @md:ws:nw"
			>
				Prisharp can detect <br className="d:none @md:d:b" />
				<span className="c:label">{technologies.length} technologies</span>,
				like
			</h2>
			<div className="d:f ai:c g:2 fg:1 min-w:0 pr:4 @md:pr:4">
				<div
					data-paused={paused || undefined}
					data-marquee-frame
					className="fg:1 min-w:0 o:h us:none c:hint"
				>
					{/* Two copies, so the loop never shows a seam; the second is hidden. */}
					<div data-marquee className="d:f w:max">
						{[0, 1].map((copy) => (
							<ul
								key={copy}
								aria-hidden={copy === 1 || undefined}
								className="d:f fs:0 m:0 p:0"
							>
								{marks.map((mark) => (
									<Item key={mark.id} mark={mark} />
								))}
							</ul>
						))}
					</div>
				</div>
				<button
					type="button"
					aria-pressed={paused}
					aria-label="Pause the technologies"
					onClick={() => setPaused(!paused)}
					className="d:f ai:c jc:c fs:0 w:8 h:8 br:md bw:1 bc:rim bg:raised c:label c:p h:bg:well fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus @prm:d:none"
				>
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
						className="d:b w:4 h:4"
					>
						{paused ? (
							<path d="M8 5.5v13l10.5-6.5z" />
						) : (
							<path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z" />
						)}
					</svg>
				</button>
			</div>
		</section>
	);
}
