import { type RefObject, useEffect, useState } from "react";
import { merge } from "yummacss/merge";
import Accordion from "@/components/ui/accordion";

interface Heading {
	id: string;
	text: string;
}

/** The article's sections, and the one being read. */
export function useHeadings(article: RefObject<HTMLElement | null>) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [active, setActive] = useState("");

	useEffect(() => {
		const nodes = [...(article.current?.querySelectorAll("h2[id]") ?? [])];
		setHeadings(
			nodes.map((node) => ({ id: node.id, text: node.textContent ?? "" })),
		);

		// a section is being read once its heading crosses the top fifth
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id);
				}
			},
			{ rootMargin: "0px 0px -80% 0px" },
		);
		for (const node of nodes) observer.observe(node);
		return () => observer.disconnect();
	}, [article]);

	return { headings, active };
}

function Links({ headings, active }: { headings: Heading[]; active: string }) {
	return (
		<ul className="d:f fd:c g:2 m:0 p:0">
			{headings.map((heading) => (
				<li key={heading.id}>
					<a
						href={`#${heading.id}`}
						aria-current={heading.id === active ? "location" : undefined}
						className={merge(
							"fs:sm td:none tp:c tdu:150",
							heading.id === active ? "c:label fw:500" : "c:hint h:c:label",
						)}
					>
						{heading.text}
					</a>
				</li>
			))}
		</ul>
	);
}

/** On wide screens, a list that stays beside the article. */
export function Toc({
	headings,
	active,
}: {
	headings: Heading[];
	active: string;
}) {
	return (
		<nav aria-label="On this page" className="p:s t:24 d:f fd:c g:3">
			<p className="m:0 fs:xs fw:600 c:hint">On this page</p>
			<Links headings={headings} active={active} />
		</nav>
	);
}

/** On a phone, the same list folded above the article. */
export function TocFold({
	headings,
	active,
}: {
	headings: Heading[];
	active: string;
}) {
	return (
		<Accordion
			className="mb:10 max-w:100% @lg:d:none"
			variant="bordered"
			items={[
				{
					value: "toc",
					title: "On this page",
					content: <Links headings={headings} active={active} />,
				},
			]}
		/>
	);
}
