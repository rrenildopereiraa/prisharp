import { catalog } from "virtual:catalog";
import {
	type CSSProperties,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { icons, pictures } from "@/marks";
import { DarkContext } from "@/theme";
import { hasLogo, Logo, url } from "./logo";
import { Tooltip } from "./tooltip";

type Mark = {
	id: string;
	name: string;
	icon: string;
	path?: string;
	/** The brand's color, #rrggbb, for a one-color mark. */
	hex?: string;
};

// The ones most people know come first, so the first logos a visitor sees
// are ones they use; the rest follow in the catalog's order.
const FAMOUS = [
	"react",
	"nextjs",
	"tailwindcss",
	"vue",
	"wordpress",
	"shopify",
	"vercel",
	"stripe",
	"cloudflare",
	"angular",
	"svelte",
	"vite",
	"google-analytics",
	"nuxt",
	"astro",
	"supabase",
	"firebase",
	"github",
	"netlify",
	"bootstrap",
	"jquery",
	"framer",
	"webflow",
	"shadcn",
	"threejs",
	"sentry",
	"webpack",
	"figma",
];
const rank = (id: string) => {
	const index = FAMOUS.indexOf(id);
	return index === -1 ? FAMOUS.length : index;
};

const unranked: Mark[] = catalog.flatMap((tech): Mark[] => {
	const icon = tech.icon ?? tech.id;
	const simple = icons[tech.id];
	if (simple) {
		return [
			{
				id: tech.id,
				name: tech.name,
				icon,
				path: simple.path,
				hex: simple.hex,
			},
		];
	}
	if (pictures.includes(icon) && hasLogo(icon)) {
		return [{ id: tech.id, name: tech.name, icon }];
	}
	return [];
});
// a stable sort keeps the catalog's order among the rest
const marks = [...unranked].sort((a, b) => rank(a.id) - rank(b.id));

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
 * One logo, in the page's hint color at rest and its brand's own when
 * hovered. A one-color mark takes the brand color from Simple Icons, unless
 * it would vanish into the page, and then the ink; a full-color logo is
 * drawn as a silhouette of itself at rest and shown as it is on hover.
 */
function Item({ mark }: { mark: Mark }) {
	const dark = useContext(DarkContext);
	const light = mark.hex ? lightness(mark.hex) : 0.5;
	const vanishes = dark ? light < 0.2 : light > 0.85;
	const brand = mark.hex && !vanishes ? `#${mark.hex}` : undefined;
	const vars = {
		"--brand": brand,
		"--silhouette": mark.path
			? undefined
			: `url(${JSON.stringify(url(mark.icon))})`,
	} as CSSProperties;

	return (
		<Tooltip label={mark.name} delay={150}>
			<div
				role="img"
				aria-label={mark.name}
				data-mark
				style={vars}
				className="d:f ai:c jc:c fs:0 h:10 px:5 @md:px:6"
			>
				{mark.path ? (
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
						className={SIZE}
					>
						<path d={mark.path} />
					</svg>
				) : (
					<>
						<span data-silhouette aria-hidden="true" className={SIZE} />
						<span data-picture aria-hidden="true">
							<Logo name={mark.icon} className={SIZE} />
						</span>
					</>
				)}
			</div>
		</Tooltip>
	);
}

/**
 * The technologies Prisharp detects, drifting past in the page's ink. Hovering
 * eases it to a stop; the button holds it still for anyone who wants it to
 * stop. Under reduced motion it never moves.
 */
export function Marquee() {
	const track = useRef<HTMLDivElement>(null);
	const [paused, setPaused] = useState(false);
	const [hovered, setHovered] = useState(false);
	const target = useRef(1);

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
				<span className="c:label">{catalog.length} technologies</span>, like
			</h2>
			<div className="d:f ai:c g:2 fg:1 min-w:0 pr:4">
				<div
					data-marquee-frame
					onPointerEnter={() => setHovered(true)}
					onPointerLeave={() => setHovered(false)}
					className="fg:1 min-w:0 o:h us:none c:hint"
				>
					{/* Two copies, so the loop never shows a seam; the second is hidden. */}
					<div ref={track} className="d:f w:max">
						{[0, 1].map((copy) => (
							<div
								key={copy}
								aria-hidden={copy === 1 || undefined}
								className="d:f fs:0"
							>
								{marks.map((mark) => (
									<Item key={mark.id} mark={mark} />
								))}
							</div>
						))}
					</div>
				</div>
				<button
					type="button"
					aria-pressed={paused}
					aria-label="Pause the technologies"
					onClick={() => setPaused(!paused)}
					className="d:f ai:c jc:c fs:0 w:8 h:8 bw:1 bc:rim bg:raised c:label c:p h:bg:well fv:os:s fv:ow:3 fv:oo:0 fv:oc:focus/40 fv:bc:focus @prm:d:none"
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
