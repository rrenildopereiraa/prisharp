import Button from "@/components/ui/button";
import { BrowserMarks } from "@/components/browsers";
import { Tooltip } from "@/components/tooltip";
import { DOWNLOAD, REPO } from "@/links";

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
	return (
		<div
			data-hero
			className="p:r d:f fd:c g:5 py:6 px:4 @md:py:12 @md:px:8 @lg:fg:1 @lg:min-w:0 @lg:py:12"
		>
			<p className="m:0 d:f ai:c fw:w g:2 ff:sans fw:500 fs:sm @md:fs:md c:hint">
				<span>A browser extension for</span>
				<BrowserMarks />
			</p>
			<h1 className="m:0 ff:sans fw:600 fs:4xl @sm:fs:5xl @md:fs:6xl lh:1 ls:1">
				What is this site
				<br /> built with?
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
						Download for Chromium <Key>D</Key>
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
