import { useEffect, useState } from "react";
import { catalog } from "virtual:catalog";
import Button from "@/components/ui/button";
import { BrowserMarks } from "@/components/browsers";
import { Tooltip } from "@/components/tooltip";
import { DOWNLOAD, REPO } from "@/links";

const TYPED = catalog.map((tech) => tech.name);
const START = Math.max(0, TYPED.indexOf("React"));

/** A keystroke's cost, in the range a person actually types at. */
const KEYSTROKE = 210;
const JITTER = 50;
const SPACE_PAUSE = 120;
const BACKSPACE = 45;

function strokeOf(char: string) {
	const gap = KEYSTROKE + (Math.random() * 2 - 1) * JITTER;
	return char === " " ? gap + SPACE_PAUSE : gap;
}

/** Types each technology's name into the sentence, then deletes it. */
function useTypedName() {
	const [name, setName] = useState(TYPED[START]);
	const [typing, setTyping] = useState(false);

	useEffect(() => {
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let alive = true;
		let index = START;
		const timers: ReturnType<typeof setTimeout>[] = [];
		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				timers.push(setTimeout(resolve, ms));
			});

		void (async () => {
			await wait(800);
			while (alive) {
				await wait(2400);
				setTyping(true);
				const current = TYPED[index];
				for (let i = current.length; i >= 0; i -= 1) {
					if (!alive) return;
					setName(current.slice(0, i));
					await wait(BACKSPACE);
				}
				await wait(380);
				index = (index + 1) % TYPED.length;
				const next = TYPED[index];
				for (let i = 1; i <= next.length; i += 1) {
					if (!alive) return;
					setName(next.slice(0, i));
					await wait(strokeOf(next[i - 1]));
				}
				setTyping(false);
			}
		})();

		return () => {
			alive = false;
			for (const timer of timers) clearTimeout(timer);
		};
	}, []);

	return { name, typing };
}

function Key({ children }: { children: string }) {
	return (
		<kbd
			aria-hidden="true"
			className="d:if ai:c jc:c h:4 min-w:4 px:1 bw:1 bc:current o:70 ff:mono fs:xs lh:1"
		>
			{children}
		</kbd>
	);
}

// the hero's buttons: the mockup's 40px height and 6px corners
const ACTION = "h:10 px:4 g:2 fs:sm us:none";

const UNZIP =
	"Unzip it, then load the folder unpacked from chrome://extensions";

export function Hero() {
	const { name, typing } = useTypedName();

	return (
		<div
			data-hero
			className="p:r d:f fd:c g:5 py:6 px:4 @md:py:12 @md:px:8 @lg:fg:1 @lg:min-w:0 @lg:py:12"
		>
			<p className="m:0 d:f ai:c fw:w g:2 ff:sans fw:400 fs:sm @md:fs:md c:hint">
				<span>A browser extension for</span>
				<BrowserMarks />
			</p>
			<h1 className="m:0 ff:sans fw:400 fs:4xl @sm:fs:5xl @md:fs:6xl lh:1">
				Was this site
				<br />
				built with <em className="c:accent fw:400">{name}</em>
				<span
					data-caret
					aria-hidden="true"
					data-typing={typing ? "" : undefined}
					className="c:accent"
				/>
				?
			</h1>
			<p className="m:0 max-w:120 fs:sm c:hint lh:5 tw:p">
				Prisharp will show you all the frameworks, libraries and hosts used on
				the page, with evidence for each.
			</p>
			<div data-actions className="d:f fw:w g:2 mt:1 @pc:d:none">
				<Tooltip label={UNZIP}>
					<Button
						id="download"
						render={<a href={DOWNLOAD} download />}
						nativeButton={false}
						shape="square"
						aria-description={UNZIP}
						className={ACTION}
					>
						Download extension <Key>D</Key>
					</Button>
				</Tooltip>
				<Button
					id="source"
					variant="secondary"
					render={<a href={REPO} />}
					nativeButton={false}
					shape="square"
					className={ACTION}
				>
					View source <Key>S</Key>
				</Button>
			</div>
		</div>
	);
}
