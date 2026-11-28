import { firefoxZip } from "virtual:catalog";
import { STORE } from "@/links";
import { Code, LINK, render, Section, Text } from "./layout";

render(
	"/docs/browsers/",
	"Prisharp is an extension for Chrome, the browsers built on Chrome's engine, and Firefox, on a computer.",
	<>
		<Section title="Chrome, Edge, Brave, Opera, Vivaldi and Arc">
			<Text>
				These browsers share Chrome's engine, Chromium, so they all install
				Prisharp from the{" "}
				<a href={STORE} className={LINK}>
					Chrome Web Store
				</a>
				. Open its page, click Add to Chrome, or the same button in your
				browser, then pin Prisharp to the toolbar so its icon is always in
				reach. Updates come through the store by themselves.
			</Text>
		</Section>

		<Section title="Firefox">
			<Text>
				Prisharp runs in Firefox 140 and later. It isn't on Firefox Add-ons yet,
				so for now it comes as a .zip you load yourself:
			</Text>
			<ol className="m:0 pl:5 d:f fd:c g:2 fs:xs c:hint lh:5">
				<li>
					Download{" "}
					<a href={firefoxZip} download className={LINK}>
						{firefoxZip.slice(1)}
					</a>
					.
				</li>
				<li>
					Open <Code>about:debugging#/runtime/this-firefox</Code> in the address
					bar.
				</li>
				<li>Click Load Temporary Add-on and pick the .zip.</li>
			</ol>
			<Text>
				Firefox keeps an add-on loaded this way until it restarts, so you load
				it again after that. Once Prisharp is on Firefox Add-ons, it installs
				and updates like any other.
			</Text>
		</Section>

		<Section title="Phones, tablets and Safari">
			<Text>
				Prisharp can't run there. It is made for browsers on a computer, and
				Chrome on phones and tablets takes no extensions at all. Safari needs
				its extensions built and shipped through Apple's App Store, which
				Prisharp isn't. Open prisharp.com on a computer, in one of the browsers
				above, to get it.
			</Text>
		</Section>
	</>,
);
