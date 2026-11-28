import {
	IconArrowsSplit,
	IconBraces,
	IconCircleCheck,
	IconClick,
	IconFolder,
	IconLayoutList,
	IconServer,
} from "@tabler/icons-react";
import { typed } from "virtual:catalog";
import { lazy, Suspense } from "react";
import type { FlowchartLink, FlowchartStep } from "@/components/ui/flowchart";
import { Proof } from "@/components/panel";
import type { Found } from "@/demo";
import { Code, DocLink, Heading, LINK, Text } from "./layout";

const ICON = "w:4 h:4";

// one real case, from the click to the popup: three of Next.js's traces add
// up to a find, and Next.js brings in React
const STEPS: FlowchartStep[] = [
	{
		id: "click",
		label: "You click",
		description: "It reads the tab",
		icon: <IconClick className={ICON} />,
		position: { x: 220, y: 0 },
	},
	{
		id: "global",
		label: "window.next",
		description: "A global",
		icon: <IconBraces className={ICON} />,
		status: "+100",
		position: { x: 0, y: 120 },
	},
	{
		id: "files",
		label: "/_next/static/",
		description: "Where files load",
		icon: <IconFolder className={ICON} />,
		status: "+100",
		position: { x: 220, y: 120 },
	},
	{
		id: "header",
		label: "x-powered-by",
		description: "A response header",
		icon: <IconServer className={ICON} />,
		status: "+100",
		position: { x: 440, y: 120 },
	},
	{
		id: "next",
		label: "Next.js",
		description: "Enough to show",
		icon: <IconCircleCheck className={ICON} />,
		status: "Found",
		position: { x: 220, y: 240 },
	},
	{
		id: "react",
		label: "React",
		description: "Next.js needs it",
		icon: <IconArrowsSplit className={ICON} />,
		status: "Brought in",
		position: { x: 440, y: 360 },
	},
	{
		id: "popup",
		label: "The popup",
		description: "Lists both",
		icon: <IconLayoutList className={ICON} />,
		position: { x: 220, y: 480 },
	},
];

const LINKS: FlowchartLink[] = [
	{ from: "click", to: "global" },
	{ from: "click", to: "files" },
	{ from: "click", to: "header" },
	{ from: "global", to: "next", running: true },
	{ from: "files", to: "next", running: true },
	{ from: "header", to: "next", running: true },
	{ from: "next", to: "react" },
	{ from: "next", to: "popup" },
	{ from: "react", to: "popup" },
];

// the chart's library is big, so only this page loads it
const Flowchart = lazy(() => import("@/components/ui/flowchart"));
const CANVAS = "h:120 @md:h:140";

// the popup's page for Next.js, as the home page draws it
const sample = typed.find((tech) => tech.name === "Next.js") ?? typed[0];
const NEXT: Found = { ...sample, icon: sample.icon ?? sample.id };

export function How() {
	return (
		<>
			<figure className="m:0 d:f fd:c g:3">
				<Suspense
					fallback={<div className={`${CANVAS} bw:1 bc:line bg:well`} />}
				>
					<Flowchart
						steps={STEPS}
						links={LINKS}
						shape="none"
						className={CANVAS}
					/>
				</Suspense>
				<figcaption className="fs:xs c:hint lh:5">
					Collect, score, relate: how Prisharp finds Next.js. Drag the steps
					around, or zoom in.
				</figcaption>
			</figure>

			<figure className="m:0 d:f fd:c g:6 @lg:fd:r @lg:ai:c">
				<div className="d:f jc:c p:6 bw:1 bc:line bg:well @lg:fs:0">
					<Proof tech={NEXT} />
				</div>
				<figcaption className="d:f fd:c g:5">
					<div className="d:f fd:c g:2">
						<Heading>The evidence</Heading>
						<Text>
							Open any result in the popup to see what gave it away, like{" "}
							<Code>window.next</Code> or <Code>/_next/static/</Code> here.
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
