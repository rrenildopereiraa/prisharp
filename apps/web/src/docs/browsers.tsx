import { siFirefoxbrowser, siSafari } from "simple-icons";
import { firefoxZip } from "virtual:catalog";
import { BrowserMarks } from "@/components/browsers";
import Button from "@/components/ui/button";
import { STORE } from "@/links";
import { CARD, Code, Heading, Text } from "./layout";

function Mark({ path }: { path: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className="w:5 h:5"
		>
			<path d={path} />
		</svg>
	);
}

const ACTION = "as:fs mt:auto us:none";

export function Browsers() {
	return (
		<ul className="m:0 p:0 sst:none d:g g:3 @lg:gtc:3">
			<li className={CARD}>
				<BrowserMarks />
				<Heading>Chrome and Chromium</Heading>
				<Text>
					Chrome, Edge, Brave, Opera, Vivaldi and Arc. Updates come by
					themselves.
				</Text>
				<Button
					render={<a href={STORE} />}
					nativeButton={false}
					size="sm"
					shape="none"
					className={ACTION}
				>
					Chrome Web Store
				</Button>
			</li>
			<li className={CARD}>
				<Mark path={siFirefoxbrowser.path} />
				<Heading>Firefox 140 and later</Heading>
				<ol className="m:0 pl:4 d:f fd:c g:1 fs:xs c:hint lh:5">
					<li>Download the .zip</li>
					<li>
						Open <Code>about:debugging</Code>
					</li>
					<li>Load Temporary Add-on</li>
				</ol>
				<Text>It stays until Firefox restarts. Firefox Add-ons is coming.</Text>
				<Button
					render={<a href={firefoxZip} download />}
					nativeButton={false}
					variant="secondary"
					size="sm"
					shape="none"
					className={ACTION}
				>
					Download .zip
				</Button>
			</li>
			<li className={`${CARD} bg:well`}>
				<Mark path={siSafari.path} />
				<Heading>Phones, tablets, Safari</Heading>
				<Text>
					Not supported. Prisharp is made for a computer, and Safari only takes
					extensions from Apple's App Store.
				</Text>
			</li>
		</ul>
	);
}
