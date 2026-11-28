import {
	firefoxPermissions,
	hostPermissions,
	permissions,
} from "virtual:catalog";
import { Code, LINK, render, Section, Text } from "./layout";
import { USES } from "./uses";

function Permission({ name }: { name: string }) {
	const firefox = firefoxPermissions.includes(name);
	return (
		<Section title={name}>
			<Text>{USES[name]}</Text>
			{!firefox && <Text>Chrome and Chromium browsers only.</Text>}
		</Section>
	);
}

render(
	"/docs/permissions/",
	"What Prisharp asks your browser for, and what each permission is used for. It asks for no access to your sites until you turn the count on.",
	<>
		{permissions.map((name) => (
			<Permission key={name} name={name} />
		))}

		<Section title="The count on the toolbar icon">
			<Text>
				The popup has a switch that puts the number of technologies on
				Prisharp's icon as each page loads, before you click. It is off until
				you turn it on. Turning it on asks your browser for access to every site
				(
				{hostPermissions.map((name, index) => (
					<span key={name}>
						{index > 0 && ", "}
						<Code>{name}</Code>
					</span>
				))}
				), because that is the only way to read a page you haven't clicked on.
				Your browser asks you first.
			</Text>
			<Text>
				Turn the switch off, or remove the access in your browser's extension
				settings, and Prisharp is back to reading only the tab you click on.
				Either way, the count is worked out in your browser and sent nowhere.
			</Text>
		</Section>

		<Section title="What leaves your browser">
			<Text>
				Nothing. The{" "}
				<a href="/privacy/" className={LINK}>
					privacy page
				</a>{" "}
				says what Prisharp reads and what it doesn't.
			</Text>
		</Section>
	</>,
);
