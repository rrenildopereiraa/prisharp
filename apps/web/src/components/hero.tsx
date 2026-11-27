import { useEffect, useRef, useState } from "react";
import { firefoxZip, typed, zip } from "virtual:catalog";
import Button from "@/components/ui/button";
import ButtonGroup from "@/components/ui/button-group";
import Dialog from "@/components/ui/dialog";
import Menu from "@/components/ui/menu";
import { BrowserMarks } from "@/components/browsers";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
	IconAlertTriangle,
	IconChevronDown,
	IconInfoCircle,
} from "@tabler/icons-react";
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

/** Which build a zip download is: for Chrome and its kin, or for Firefox. */
type Build = "chrome" | "firefox";

const ZIPS: Record<Build, string> = { chrome: zip, firefox: firefoxZip };

/** Saves the zip, as its link would. */
function download(path: string) {
	const link = document.createElement("a");
	link.href = path;
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

/**
 * A short warning before a zip downloads: it's what's on main, not what the
 * Chrome Web Store has. Firefox has no store listing yet, so its zip is the
 * only way to try Prisharp there.
 */
function PreviewDialog({
	build,
	onOpenChange,
}: {
	build: Build | null;
	onOpenChange: (open: boolean) => void;
}) {
	// the last build asked for, so the text holds while the dialog closes
	const [shown, setShown] = useState<Build>("chrome");
	useEffect(() => {
		if (build) setShown(build);
	}, [build]);
	const page = usePage();
	if (!page) return null;

	return (
		<Dialog
			container={page}
			open={build !== null}
			onOpenChange={onOpenChange}
			shape="none"
			header={
				<IconAlertTriangle aria-hidden="true" className="w:6 h:6 c:red" />
			}
			title={
				shown === "firefox"
					? "Download for Firefox as a .zip"
					: "Download the dev version as a .zip"
			}
			description={
				<>
					<code className="c:label">{ZIPS[shown].slice(1)}</code> is built from{" "}
					<code className="c:label">main</code>. It's unreleased and may be
					broken,{" "}
					{shown === "firefox"
						? "and Prisharp isn't on Firefox Add-ons yet."
						: "so for everyday use, get Prisharp from the Chrome Web Store."}
				</>
			}
			cancelLabel="Cancel"
			confirmLabel="Download .zip"
			confirmVariant="danger"
			onConfirm={() => download(ZIPS[shown])}
		>
			{/* room between the text and the buttons */}
			<span aria-hidden="true" className="d:b h:2" />
		</Dialog>
	);
}

// the hero's buttons: the mockup's 40px height and 6px corners
const ACTION = "h:10 px:4 g:2 fs:sm us:none";

export function Hero({ onName }: { onName?: (name: string) => void }) {
	const { name, typing } = useTypedName(onName);
	const page = usePage();
	// a zip: from the menu beside the install button, or Shift+A for this
	// browser's own; in Firefox, the install button itself
	const [preview, setPreview] = useState<Build | null>(null);
	const own: Build = FIREFOX ? "firefox" : "chrome";
	useHotkey("Shift+A", () => setPreview(own));

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
			{UNSUPPORTED && (
				<p className="m:0 d:f ai:c g:2 fs:sm c:label">
					<IconInfoCircle aria-hidden="true" className="w:4 h:4 fs:0" />
					Prisharp works in Chrome and Firefox on a computer.
				</p>
			)}
			<div data-actions className="d:f fw:w g:2 mt:1">
				{!UNSUPPORTED && (
					<ButtonGroup shape="none">
						{FIREFOX ? (
							<Button
								id="install"
								onClick={() => setPreview("firefox")}
								className={ACTION}
							>
								Download for Firefox <Key>A</Key>
							</Button>
						) : (
							<Button
								id="install"
								render={<a href={STORE} />}
								nativeButton={false}
								className={ACTION}
							>
								Add to Chrome <Key>A</Key>
							</Button>
						)}
						<Menu
							container={page}
							shape="none"
							trigger={
								<Button
									aria-label="Other ways to get Prisharp"
									className="h:10 px:3"
								>
									<IconChevronDown aria-hidden="true" className="w:4 h:4" />
								</Button>
							}
							items={
								FIREFOX
									? [
											{
												label: "Download for Chrome (.zip)…",
												onClick: () => setPreview("chrome"),
											},
										]
									: [
											{
												label: "Download the dev version (.zip)…",
												onClick: () => setPreview("chrome"),
											},
											{
												label: "Download for Firefox (.zip)…",
												onClick: () => setPreview("firefox"),
											},
										]
							}
						/>
					</ButtonGroup>
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
			<PreviewDialog
				build={preview}
				onOpenChange={(open) => {
					if (!open) setPreview(null);
				}}
			/>
		</div>
	);
}
