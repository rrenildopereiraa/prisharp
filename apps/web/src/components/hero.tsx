import { type ReactNode, useEffect, useRef, useState } from "react";
import { firefoxZip, typed, zip } from "virtual:catalog";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { FOCUS } from "@/components/ui/style";
import { BrowserMarks } from "@/components/browsers";
import { IconAlertTriangle, IconBuildingStore } from "@tabler/icons-react";
import { FIREFOX, UNSUPPORTED } from "@/browser";
import { REPO, STORE } from "@/links";

// best known first, as in the marquee, picked at build time
const TYPED = typed.map((tech) => tech.name);
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

/** The name the heading types first, and so the one the page opens on. */
export const FIRST = TYPED[START];

/**
 * Types each technology's name into the sentence, then deletes it, and says
 * which one is on the page once its name is whole.
 */
function useTypedName(onName?: (name: string) => void) {
	const [name, setName] = useState(TYPED[START]);
	// the latest callback, read when a name is whole, so typing never restarts
	const report = useRef(onName);
	report.current = onName;
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
				report.current?.(next);
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
			className="d:if ai:c jc:c h:4 min-w:4 px:1 bw:1 bc:current o:70 ff:mono fs:xs lh:1 @pc:d:none"
		>
			{children}
		</kbd>
	);
}

/** This browser's zip: the Firefox build in Firefox, the Chromium one elsewhere. */
const ZIP = FIREFOX ? firefoxZip : zip;

/** Saves the zip, as its link would. */
function download() {
	const link = document.createElement("a");
	link.href = ZIP;
	link.download = "";
	link.click();
}

/**
 * The page's own wrapper, for popups to render in, so they take its font and
 * colors rather than the body's.
 */
function usePage() {
	const [page, setPage] = useState<HTMLElement | null>(null);
	useEffect(
		() => setPage(document.querySelector<HTMLElement>("[data-page]")),
		[],
	);
	return page;
}

// a choice in the dialog: a row with a glyph, a name and a line about it
const CHOICE = `d:f ai:fs g:3 w:100% p:3 bw:1 bc:line bg:raised c:label ta:l td:none fs:sm ${FOCUS}`;

function Choice({
	icon,
	title,
	children,
}: {
	icon: ReactNode;
	title: string;
	children: ReactNode;
}) {
	return (
		<>
			<span aria-hidden="true" className="d:f fs:0">
				{icon}
			</span>
			<span className="d:f fd:c g:1">
				<span className="fw:500">{title}</span>
				<span className="c:hint lh:5">{children}</span>
			</span>
		</>
	);
}

/**
 * Where to get Prisharp for this browser: its store, the released version,
 * or the zip built from main, unreleased. Firefox has no store listing yet,
 * so there the zip is the only way.
 */
function GetDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const page = usePage();
	if (!page) return null;

	return (
		<Dialog
			container={page}
			open={open}
			onOpenChange={onOpenChange}
			shape="none"
			title={FIREFOX ? "Add Prisharp to Firefox" : "Add Prisharp to Chrome"}
			description="Pick the version you want."
		>
			<div className="d:f fd:c g:2 pt:2 pb:4">
				{FIREFOX ? (
					<div aria-disabled="true" className={`${CHOICE} o:60`}>
						<Choice
							icon={<IconBuildingStore className="w:5 h:5" />}
							title="Firefox Add-ons"
						>
							Coming soon.
						</Choice>
					</div>
				) : (
					<a href={STORE} className={`${CHOICE} h:bg:well`}>
						<Choice
							icon={<IconBuildingStore className="w:5 h:5 c:accent" />}
							title="Chrome Web Store"
						>
							The released version. It updates by itself.
						</Choice>
					</a>
				)}
				<button
					type="button"
					onClick={() => {
						download();
						onOpenChange(false);
					}}
					className={`${CHOICE} c:p h:bg:well`}
				>
					<Choice
						icon={<IconAlertTriangle className="w:5 h:5 c:red" />}
						title="Dev version (.zip)"
					>
						<code className="c:label">{ZIP.slice(1)}</code>, built from{" "}
						<code className="c:label">main</code>. Unreleased, and may be
						broken.
					</Choice>
				</button>
			</div>
		</Dialog>
	);
}

// the hero's buttons: the mockup's 40px height and 6px corners
const ACTION = "h:10 px:4 g:2 fs:sm us:none";

export function Hero({ onName }: { onName?: (name: string) => void }) {
	const { name, typing } = useTypedName(onName);
	const [getting, setGetting] = useState(false);

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
			<div data-actions className="d:f fw:w g:2 mt:1">
				{UNSUPPORTED ? (
					// phones, tablets and Safari: step 1 says where it works
					<Button disabled shape="none" className={ACTION}>
						Not available
					</Button>
				) : (
					<Button
						id="install"
						onClick={() => setGetting(true)}
						shape="none"
						className={ACTION}
					>
						{FIREFOX ? "Add to Firefox" : "Add to Chrome"} <Key>A</Key>
					</Button>
				)}
				<Button
					id="source"
					variant="secondary"
					render={<a href={REPO} />}
					nativeButton={false}
					shape="none"
					className={ACTION}
				>
					View source <Key>S</Key>
				</Button>
			</div>
			<GetDialog open={getting} onOpenChange={setGetting} />
		</div>
	);
}
