import { IconSearch } from "@tabler/icons-react";
import {
	useCallback,
	useContext,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
} from "react";
import { catalog, categories, logoLoaders } from "virtual:catalog/docs";
import { LogosContext } from "@/components/logo";
import { Proof } from "@/components/panel";
import Button from "@/components/ui/button";
import Drawer from "@/components/ui/drawer";
import Autocomplete from "@/components/ui/autocomplete";
import type { Found } from "@/demo";
import { REPO } from "@/links";
import { DarkContext } from "@/theme";
import { useCategory } from "./category";
import { CategoryIndex } from "./index-list";
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
function Logo({ tech, ready }: { tech: Tech; ready: boolean }) {
	const dark = useContext(DarkContext);
	const logos = useContext(LogosContext);
	const icon = tech.icon ?? tech.id;
	const file = dark && `${icon}-dark` in logos ? `${icon}-dark` : icon;
	const box = "w:5 h:5 fs:0";
	// a blank tile until the category's logos arrive, so no letter flashes first
	if (!ready) return <span aria-hidden="true" className={`${box} bg:well`} />;
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

/**
 * Each category's logos, loaded the first time it comes near the screen or
 * one of its technologies is picked, and every loaded one merged into one map.
 */
function useLogos() {
	const [logos, setLogos] = useState<Record<string, string>>({});
	const [ready, setReady] = useState<Set<string>>(() => new Set());
	const asked = useRef(new Set<string>());
	const load = useCallback((category: string) => {
		if (asked.current.has(category)) return;
		asked.current.add(category);
		void logoLoaders[categories.indexOf(category)]().then((files) => {
			setLogos((current) => ({ ...current, ...files }));
			setReady((current) => new Set(current).add(category));
		});
	}, []);
	return { logos, ready, load };
}

/** A–Z, as people look a name up, ignoring case. */
const byName = (a: Tech, b: Tech) =>
	a.name.localeCompare(b.name, "en", { sensitivity: "base" });

const COUNTS = new Map(
	categories.map((category) => [
		category,
		catalog.filter((tech) => tech.category === category).length,
	]),
);

export function Technologies() {
	const { logos, ready, load } = useLogos();
	const [query, setQuery] = useState("");
	const deferred = useDeferredValue(query);
	const category = useCategory();
	const [picked, setPicked] = useState<Tech>(
		() => catalog.filter((tech) => tech.category === category).sort(byName)[0],
	);
	// the phone's index, in a drawer of its own
	const [index, setIndex] = useState(false);
	// drawers open inside the docs, so they take its font and colors
	const [page, setPage] = useState<HTMLElement | null>(null);
	useEffect(
		() => setPage(document.querySelector<HTMLElement>("[data-docs]")),
		[],
	);

	// a search looks through every category; otherwise one category shows
	const searching = deferred.trim() !== "";
	const shown = catalog
		.filter((tech) =>
			searching ? matches(tech.name, deferred) : tech.category === category,
		)
		.sort(byName);

	// only the logos of what is on screen
	const needed = [...new Set(shown.map((tech) => tech.category))].join("|");
	useEffect(() => {
		for (const name of needed.split("|")) if (name) load(name);
	}, [needed, load]);

	// on a narrow screen the evidence opens in a sheet over the list
	const [sheet, setSheet] = useState(false);
	const pick = (tech: Tech) => {
		setPicked(tech);
		if (!matchMedia("(min-width: 64rem)").matches) setSheet(true);
	};

	// every technology as a suggestion, its category beside it
	const suggestions = catalog
		.map((tech) => ({
			label: tech.name,
			description: tech.category,
			icon: <Logo tech={tech} ready={ready.has(tech.category)} />,
		}))
		.sort((a, b) =>
			a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
		);

	// picking a suggestion fills in its whole name, which opens its evidence
	const search = (text: string) => {
		setQuery(text);
		const exact = catalog.find((tech) => tech.name === text);
		if (exact) pick(exact);
	};

	return (
		<LogosContext.Provider value={logos}>
			<div className="d:f fd:c g:6 @lg:fd:rr @lg:ai:fs">
				<div className="d:none jc:c p:4 bw:1 bc:line bg:well @lg:d:f @lg:p:st @lg:t:6 @lg:fs:0">
					<Proof tech={found(picked)} />
				</div>
				<Drawer
					container={page}
					open={sheet}
					onOpenChange={setSheet}
					side="bottom"
					handle
					shape="none"
					title={picked.name}
					closeLabel="Close"
				>
					<div className="d:f jc:c">
						<Proof tech={found(picked)} />
					</div>
				</Drawer>

				<div className="d:f fd:c g:5 fg:1 min-w:0">
					<Autocomplete
						label="Search"
						placeholder={`${catalog.length} technologies`}
						icon={<IconSearch aria-hidden className="w:4 h:4" />}
						items={suggestions}
						onQueryChange={search}
						emptyMessage="No technology by that name"
						autoHighlight
						limit={8}
						size="lg"
						shape="none"
						container={page}
						className="w:100%"
						description={
							searching ? `${shown.length} found in every category` : undefined
						}
					/>

					{!searching && (
						<div className="d:f ai:c jc:sb g:3">
							{/* the page's heading names the category */}
							<p className="m:0 fs:sm c:hint">
								{COUNTS.get(category) === 1
									? "1 technology"
									: `${COUNTS.get(category)} technologies`}
							</p>
							{/* on wider screens the index is in the side menu */}
							<Drawer
								container={page}
								trigger="Categories"
								open={index}
								onOpenChange={setIndex}
								side="bottom"
								handle
								size="sm"
								shape="none"
								title="Categories"
								closeLabel="Close"
								className="@md:d:none"
							>
								<CategoryIndex
									current={category}
									onPick={() => setIndex(false)}
								/>
							</Drawer>
						</div>
					)}

					<ul className="m:0 p:0 sst:none d:g g:1 gtc:2 @sm:gtc:3 @lg:gtc:2 @xl:gtc:3">
						{shown.map((tech) => {
							const here = tech.id === picked.id;
							return (
								<li key={tech.id} className="min-w:0">
									<Button
										variant={here ? "secondary" : "ghost"}
										size="sm"
										shape="none"
										aria-pressed={here}
										title={tech.name}
										onClick={() => pick(tech)}
										className={`w:100% jc:fs fw:400 ${here ? "c:accent" : ""}`}
									>
										<Logo tech={tech} ready={ready.has(tech.category)} />
										<span className="min-w:0 to:e ws:nw o:h">{tech.name}</span>
									</Button>
								</li>
							);
						})}
					</ul>

					<Text>
						{searching && shown.length === 0 && (
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
