import { typed } from "virtual:catalog";
import { Proof } from "@/components/panel";
import type { Found } from "@/demo";
import { Code, DocLink, Heading, LINK, Text } from "./layout";

// the popup's page for Next.js, as the home page draws it
const sample = typed.find((tech) => tech.name === "Next.js") ?? typed[0];
const NEXT: Found = { ...sample, icon: sample.icon ?? sample.id };

export function How() {
	return (
		<>
			<figure className="m:0 d:f fd:c g:6 @lg:fd:r @lg:ai:c">
				<div className="d:f jc:c p:6 bw:1 bc:line bg:well @lg:fs:0">
					<Proof tech={NEXT} />
				</div>
				<figcaption className="d:f fd:c g:5">
					<div className="d:f fd:c g:2">
						<Heading>The evidence</Heading>
						<Text>
							Click the icon and Prisharp reads the tab once. Open any result to
							see what gave it away, like <Code>window.next</Code> or{" "}
							<Code>/_next/static/</Code> here.
						</Text>
					</div>
					<div className="d:f fd:c g:2">
						<Heading>What comes with it</Heading>
						<Text>
							Next.js is built on React, so finding one brings in the other.
						</Text>
					</div>
					<div className="d:f fd:c g:2">
						<Heading>Why some count double</Heading>
						<Text>
							A trace only one technology leaves is enough on its own. One that
							others could leave counts half and needs a second.
						</Text>
					</div>
					<div className="d:f fd:c g:2">
						<Heading>What it can't see</Heading>
						<Text>
							Code that runs on a site's servers never reaches your browser, so
							it can't be read.
						</Text>
					</div>
				</figcaption>
			</figure>

			<Text>
				All of it happens in your browser and nothing is sent anywhere. See the{" "}
				<DocLink page="/docs/technologies/" className={LINK}>
					technologies
				</DocLink>{" "}
				for every trace, or{" "}
				<a href="/privacy/" className={LINK}>
					privacy
				</a>{" "}
				for what is read.
			</Text>
		</>
	);
}
