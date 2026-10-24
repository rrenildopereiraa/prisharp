import { technologies } from "extension/technologies";
import { useContext, useEffect, useRef, useState } from "react";
import { icons, pictures } from "@/marks";
import { DarkContext } from "@/theme";
import { hasLogo, Logo } from "./logo";

type Mark = {
	id: string;
	name: string;
	icon: string;
	hex?: string;
	path?: string;
};

interface Technology {
	id: string;
	name: string;
	icon?: string;
}

const marks: Mark[] = (technologies as Technology[]).flatMap((tech): Mark[] => {
	const icon = tech.icon ?? tech.id;
	const simple = icons[tech.id];
	if (simple) return [{ id: tech.id, name: tech.name, icon, ...simple }];
	if (pictures.includes(icon) && hasLogo(icon)) {
		return [{ id: tech.id, name: tech.name, icon }];
	}
	return [];
});

// pixels a second at full speed, and how quickly it eases to a stop or back
const SPEED = 36;
const EASE = 2.5;

const SIZE = "d:b w:6 h:6 @md:w:7 @md:h:7";

/** How light a #rrggbb color is, 0 to 1. */
const lightness = (hex: string) => {
	const [r, g, b] = [0, 2, 4].map(
		(at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255,
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * A mark in the page's ink that takes its brand color while hovered. It is
 * one picture throughout: only the color changes, never the shape or size.
 */
function Item({
	mark,
	lit,
	dark,
	onLight,
}: {
	mark: Mark;
	lit: boolean;
	dark: boolean;
	onLight: (id: string | null) => void;
}) {
	// a brand color that would vanish into the page keeps the ink instead
	const brand =
		mark.hex && (dark ? lightness(mark.hex) > 0.25 : lightness(mark.hex) < 0.85)
			? `#${mark.hex}`
			: undefined;

	return (
		<li
			role="img"
			aria-label={mark.name}
			title={mark.name}
			onPointerEnter={() => onLight(mark.id)}
			onPointerLeave={() => onLight(null)}
			className="d:f ai:c jc:c fs:0 h:10 px:5 @md:px:6"
		>
			{mark.path ? (
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
					className={`${SIZE} tp:c tdu:200 @prm:tp:none ${lit && brand ? "" : "c:hint"}`}
					style={lit && brand ? { color: brand } : undefined}
				>
					<path d={mark.path} />
				</svg>
			) : (
				<span data-tint data-lit={lit || undefined} aria-hidden="true">
					<Logo name={mark.icon} className={`${SIZE} of:c`} />
				</span>
			)}
		</li>
	);
}

/**
 * The technologies Prisharp detects, drifting past in the page's ink. Hovering
 * eases it to a stop and shows that logo in color; the button holds it still
 * for anyone who wants it to stop. Under reduced motion it never moves.
 */
export function Marquee() {
	const track = useRef<HTMLDivElement>(null);
	const [paused, setPaused] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [lit, setLit] = useState<string | null>(null);
	const target = useRef(1);
	const dark = useContext(DarkContext);

	useEffect(() => {
		target.current = paused || hovered ? 0 : 1;
	}, [paused, hovered]);

	useEffect(() => {
		const element = track.current;
		if (!element) return;
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let frame = 0;
		let last = performance.now();
		let speed = target.current;
		let offset = 0;
		const step = (now: number) => {
			const seconds = Math.min((now - last) / 1000, 0.1);
			last = now;
			// ease toward the target speed, so a stop slows down rather than snaps
			speed += (target.current - speed) * (1 - Math.exp(-seconds * EASE));
			offset -= SPEED * speed * seconds;
			const loop = element.scrollWidth / 2;
			if (loop > 0 && -offset >= loop) offset += loop;
			element.style.translate = `${offset}px 0`;
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	}, []);

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
			<div className="d:f ai:c g:2 fg:1 min-w:0 pr:4">
				<div
					data-marquee-frame
					onPointerEnter={() => setHovered(true)}
					onPointerLeave={() => {
						setHovered(false);
						setLit(null);
					}}
					className="fg:1 min-w:0 o:h us:none c:hint"
				>
					{/* Two copies, so the loop never shows a seam; the second is hidden. */}
					<div ref={track} className="d:f w:max">
						{[0, 1].map((copy) => (
							<ul
								key={copy}
								aria-hidden={copy === 1 || undefined}
								className="d:f fs:0 m:0 p:0"
							>
								{marks.map((mark) => (
									<Item
										key={mark.id}
										mark={mark}
										lit={lit === mark.id}
										dark={dark}
										onLight={setLit}
									/>
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
					className="d:f ai:c jc:c fs:0 w:8 h:8 br:md bw:1 bc:rim bg:raised c:label c:p h:bg:well fv:os:s fv:ow:3 fv:oo:0 fv:oc:focus/40 fv:bc:focus @prm:d:none"
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
