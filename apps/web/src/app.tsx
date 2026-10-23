import { useRef, useState } from "react";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { mdx } from "@/components/mdx";
import { Navbar } from "@/components/navbar";
import { Toc, TocFold, useHeadings } from "@/components/toc";
import Content from "@/content.mdx";
import {
	applyTheme,
	DarkContext,
	type Theme,
	THEME_KEY,
	useDark,
} from "@/theme";

const saved = (): Theme => {
	try {
		const theme = localStorage.getItem(THEME_KEY);
		if (theme === "light" || theme === "dark") return theme;
	} catch {}
	return "system";
};

export function App() {
	const [theme, setTheme] = useState(saved);
	const dark = useDark(theme);
	const article = useRef<HTMLElement>(null);
	const { headings, active } = useHeadings(article);

	const onTheme = (next: Theme) => {
		applyTheme(next);
		setTheme(next);
	};

	return (
		<DarkContext.Provider value={dark}>
			<div className="d:f fd:c min-h:dvh bg:raised c:label">
				<Navbar onTheme={onTheme} />
				<main className="fg:1 w:100% max-w:256 mx:auto px:5 @md:px:8">
					<Hero />
					<div className="d:f g:16 pb:24">
						<article ref={article} className="fg:1 min-w:0 max-w:180">
							<TocFold headings={headings} active={active} />
							<Content components={mdx} />
						</article>
						<aside className="d:none w:56 fs:0 @lg:d:b">
							<Toc headings={headings} active={active} />
						</aside>
					</div>
				</main>
				<Footer />
			</div>
		</DarkContext.Provider>
	);
}
