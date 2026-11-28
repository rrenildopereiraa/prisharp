import { useContext, useDeferredValue, useRef, useState } from "react";
import { catalog, categories, logos } from "virtual:catalog/docs";
import { LogosContext } from "@/components/logo";
import { Proof } from "@/components/panel";
import type { Found } from "@/demo";
import { REPO } from "@/links";
import { DarkContext } from "@/theme";
import { Code, LINK, Text } from "./layout";
import { matches } from "./search";

type Tech = (typeof catalog)[number];

const REQUEST = `${REPO}/issues/new?template=technology.yml`;

/** A technology as the popup's evidence page reads it. Weak traces say so. */
const found = (tech: Tech): Found => ({
	...tech,
	icon: tech.icon ?? tech.id,
	evidence: tech.evidence.map(({ kind, text, weak }) => ({
		kind,
		text,
		value: weak ? "counts half" : undefined,
	})),
});

/** A technology's logo, in its dark variant on a dark page, else its letter. */
function Logo({ tech }: { tech: Tech }) {
	const dark = useContext(DarkContext);
	const icon = tech.icon ?? tech.id;
	const file = dark && `${icon}-dark` in logos ? `${icon}-dark` : icon;
	const box = "w:5 h:5 fs:0";
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
			width={20}
			height={20}
			loading="lazy"
			draggable={false}
			data-logo
			className={box}
		/>
	);
}

export function Technologies() {
	const [query, setQuery] = useState("");
	const deferred = useDeferredValue(query);
	const [picked, setPicked] = useState<Tech>(catalog[0]);
	const preview = useRef<HTMLDivElement>(null);

	const shown = catalog.filter((tech) => matches(tech.name, deferred));
	const groups = categories
		.map((category) => ({
			category,
			techs: shown.filter((tech) => tech.category === category),
		}))
		.filter((group) => group.techs.length > 0);

	const pick = (tech: Tech) => {
		setPicked(tech);
		// on a narrow screen the preview sits above the list
		if (!matchMedia("(min-width: 64rem)").matches) {
			preview.current?.scrollIntoView({ block: "nearest" });
		}
	};

	return (
		<LogosContext.Provider value={logos}>
			<div className="d:f fd:c g:6 @lg:fd:rr @lg:ai:fs">
				<div
					ref={preview}
					className="d:f jc:c p:4 bw:1 bc:line bg:well @lg:p:st @lg:t:6 @lg:fs:0"
				>
					<Proof tech={found(picked)} />
				</div>

				<div className="d:f fd:c g:6 fg:1 min-w:0">
					<div className="d:f fd:c g:2">
						<input
							type="search"
							aria-label={`Search ${catalog.length} technologies`}
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder={`Search ${catalog.length} technologies`}
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
						<section key={group.category} className="d:f fd:c g:2">
							<h2 className="m:0 ff:mono fs:xs fw:500 c:hint">
								{group.category}
							</h2>
							<ul className="m:0 p:0 sst:none d:g gtc:2 @sm:gtc:3 @lg:gtc:2">
								{group.techs.map((tech) => {
									const here = tech.id === picked.id;
									return (
										<li key={tech.id} className="min-w:0">
											<button
												type="button"
												aria-pressed={here}
												title={tech.name}
												onClick={() => pick(tech)}
												className={`d:f ai:c g:2 w:100% h:10 px:2 bw:0 ta:l ff:mono fs:xs c:p fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus ${
													here
														? "bg:raised c:accent"
														: "bg:transparent c:label h:bg:well"
												}`}
											>
												<Logo tech={tech} />
												<span className="min-w:0 to:e ws:nw o:h">
													{tech.name}
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						</section>
					))}

					<Text>
						{shown.length === 0 && (
							<>
								No match for <Code>{deferred.trim()}</Code>.{" "}
							</>
						)}
						Missing one?{" "}
						<a href={REQUEST} className={LINK}>
							Request a technology
						</a>
					</Text>
				</div>
			</div>
		</LogosContext.Provider>
	);
}
