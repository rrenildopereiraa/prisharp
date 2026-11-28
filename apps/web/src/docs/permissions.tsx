import type { ReactNode } from "react";
import {
	firefoxPermissions,
	hostPermissions,
	permissions,
} from "virtual:catalog";
import { Code, LINK, Text } from "./layout";
import { USES } from "./uses";

function Tag({ children }: { children: ReactNode }) {
	return (
		<span className="px:2 py:1 bw:1 bc:line c:hint fs:xs ws:nw">
			{children}
		</span>
	);
}

function Row({
	name,
	use,
	tag,
}: {
	name: ReactNode;
	use: string;
	tag?: string;
}) {
	return (
		<li className="d:f fd:c g:2 py:4 btw:1 btc:line @sm:fd:r @sm:ai:c @sm:g:4">
			<span className="w:40 fs:0">{name}</span>
			<span className="fg:1 fs:xs c:hint lh:5">{use}</span>
			{tag && <Tag>{tag}</Tag>}
		</li>
	);
}

export function Permissions() {
	return (
		<>
			<ul className="m:0 p:0 sst:none max-w:160 bbw:1 bbc:line">
				{permissions.map((name) => (
					<Row
						key={name}
						name={<Code>{name}</Code>}
						use={USES[name]}
						tag={firefoxPermissions.includes(name) ? undefined : "Chrome only"}
					/>
				))}
				<Row
					name={hostPermissions.map((name) => (
						<Code key={name}>{name}</Code>
					))}
					use="Only if you turn on the count on the toolbar icon, so it can count before you click. Turn it off and the access goes."
					tag="Off until you ask"
				/>
			</ul>
			<Text>
				Everything stays in your browser.{" "}
				<a href="/privacy/" className={LINK}>
					Privacy
				</a>
			</Text>
		</>
	);
}
