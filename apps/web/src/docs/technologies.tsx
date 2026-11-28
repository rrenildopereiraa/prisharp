import { useContext, useDeferredValue, useState } from "react";
import { catalog, categories, logos } from "virtual:catalog/docs";
import { REPO } from "@/links";
import { DarkContext } from "@/theme";
import { Code, LINK, render, Text } from "./layout";
import { matches } from "./search";

type Tech = (typeof catalog)[number];

const REQUEST = `${REPO}/issues/new?template=technology.yml`;

/** A technology's logo, in its dark variant on a dark page, else its letter. */
function Logo({ tech }: { tech: Tech }) {
	const dark = useContext(DarkContext);
	const icon = tech.icon ?? tech.id;
	const file = dark && `${icon}-dark` in logos ? `${icon}-dark` : icon;
	const box = "w:6 h:6 fs:0";
	if (!(file in logos)) {
		return (
			<span
				aria-hidden="true"
				className={`${box} d:f ai:c jc:c bg:well c:hint fs:xs fw:500`}
			>
				{tech.name[0]}
			</span>
		);
	}
	return (
		<img
			src={logos[file]}
			alt=""
			width={24}
			height={24}
			loading="lazy"
			draggable={false}
			data-logo
			className={box}
		/>
	);
}

const host = (website: string) => new URL(website).host.replace(/^www\./, "");

function Entry({ tech }: { tech: Tech }) {
	return (
		<li className="d:f fd:c g:3 py:4 btw:1 btc:line">
			<div className="d:f ai:c g:3 min-w:0">
				<Logo tech={tech} />
				<h3 className="m:0 fs:sm fw:500 c:label">{tech.name}</h3>
				<a
					href={tech.website}
					className="ml:auto fs:xs c:hint td:none to:e ws:nw o:h h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
				>
					{host(tech.website)}
				</a>
			</div>
			<ul className="m:0 p:0 sst:none d:f fd:c g:1 pl:9">
				{tech.evidence.map((line) => (
					<li
						key={`${line.kind} ${line.text}`}
						className="d:f fw:w ai:b cg:3 rg:1 fs:xs lh:5"
					>
						<span className="w:20 fs:0 c:hint">{line.kind}</span>
						<span className="min-w:0 c:label ff:mono ow:bw">{line.text}</span>
						{line.weak && <span className="c:hint">counts half</span>}
					</li>
				))}
				{tech.implies.length > 0 && (
					<li className="d:f fw:w ai:b cg:3 rg:1 fs:xs lh:5">
						<span className="w:20 fs:0 c:hint">Brings in</span>
						<span className="min-w:0 c:label">{tech.implies.join(", ")}</span>
					</li>
				)}
			</ul>
		</li>
	);
}

function Technologies() {
	const [query, setQuery] = useState("");
	const deferred = useDeferredValue(query);
	const shown = catalog.filter((tech) => matches(tech.name, deferred));
	const groups = categories
		.map((category) => ({
			category,
			techs: shown.filter((tech) => tech.category === category),
		}))
		.filter((group) => group.techs.length > 0);

	return (
		<>
			<div className="d:f fd:c g:2">
				<label htmlFor="search" className="fs:xs c:hint">
					Search {catalog.length} technologies
				</label>
				<input
					id="search"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Next.js, Stripe, Vercel…"
					autoComplete="off"
					spellCheck={false}
					className="h:10 px:3 bw:1 bc:rim bg:raised c:label ff:mono fs:md @sm:fs:sm bs-o:sunk p::c:hint f:os:s f:ow:2 f:oo:-1 f:oc:focus"
				/>
				<p aria-live="polite" className="m:0 fs:xs c:hint">
					{deferred.trim()
						? `${shown.length} found`
						: `${catalog.length} in ${groups.length} categories`}
				</p>
			</div>

			{groups.map((group) => (
				<section key={group.category} className="d:f fd:c">
					<h2 className="m:0 pb:2 ff:mono fs:sm fw:500">
						{group.category}{" "}
						<span className="c:hint fw:400">{group.techs.length}</span>
					</h2>
					<ul className="m:0 p:0 sst:none">
						{group.techs.map((tech) => (
							<Entry key={tech.id} tech={tech} />
						))}
					</ul>
				</section>
			))}

			<Text>
				{shown.length === 0 && (
					<>
						Prisharp doesn't detect <Code>{deferred.trim()}</Code> yet.{" "}
					</>
				)}
				Missing one?{" "}
				<a href={REQUEST} className={LINK}>
					Request a technology
				</a>{" "}
				on GitHub, with a site that uses it.
			</Text>
		</>
	);
}

render(
	"/docs/technologies/",
	"Every framework, library, host and service Prisharp detects, with the evidence it looks for. A trace marked counts half needs a second one beside it.",
	<Technologies />,
);
