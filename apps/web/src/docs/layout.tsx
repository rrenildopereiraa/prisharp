import {
	createContext,
	useContext,
	type MouseEvent,
	type ReactNode,
} from "react";

/** The docs' pages, in the order the side menu lists them. */
export const PAGES = [
	{ href: "/docs/", title: "How it works" },
	{ href: "/docs/browsers/", title: "Browsers" },
	{ href: "/docs/technologies/", title: "Technologies" },
	{ href: "/docs/permissions/", title: "Permissions" },
] as const;

export type Page = (typeof PAGES)[number]["href"];

/** A link inside the docs' text. */
export const LINK =
	"c:label td:u h:c:accent fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

/** A word as code: a global, a header, a permission. */
export function Code({ children }: { children: ReactNode }) {
	return (
		<code className="px:1 bg:well c:label ff:mono fs:xs ow:bw">{children}</code>
	);
}

/** A short paragraph in the docs' quiet color. */
export function Text({ children }: { children: ReactNode }) {
	return <p className="m:0 fs:xs c:hint lh:5">{children}</p>;
}

/** A small heading over a part of a page. */
export function Heading({ children }: { children: ReactNode }) {
	return <h2 className="m:0 ff:mono fs:sm fw:500">{children}</h2>;
}

/** A framed box, as the home page's steps and the site's cards are drawn. */
export const CARD = "d:f fd:c g:3 p:5 bw:1 bc:line bg:raised";

/**
 * Follows a link to another docs page without loading it again, unless the
 * person asked for a new tab or window.
 */
export const follow =
	(go: (page: Page) => void, page: Page) => (event: MouseEvent) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		if (event.button !== 0) return;
		event.preventDefault();
		go(page);
	};

/** Goes to another docs page in place. */
export const GoContext = createContext<(page: Page) => void>(() => {});

/** A link to another docs page, followed in place. */
export function DocLink({
	page,
	className,
	children,
}: {
	page: Page;
	className: string;
	children: ReactNode;
}) {
	const go = useContext(GoContext);
	return (
		<a href={page} onClick={follow(go, page)} className={className}>
			{children}
		</a>
	);
}
