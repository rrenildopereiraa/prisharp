import ThemeSwitcher from "@/components/ui/theme-switcher";
import { REPO } from "@/links";
import { type Theme, THEME_KEY } from "@/theme";
import { Logo } from "./logo";

export function Navbar({ onTheme }: { onTheme: (theme: Theme) => void }) {
	return (
		<header className="p:s t:0 zi:10 bg:raised/80 bf:b(12px) bbw:1 bbc:line">
			<nav className="d:f ai:c jc:sb g:4 max-w:256 mx:auto px:5 h:14 @md:px:8">
				<a href="#top" className="d:f ai:c g:2 fw:600 c:label td:none">
					<img src="/icon.png" alt="" className="w:6 h:6" />
					Prisharp
				</a>
				<div className="d:f ai:c g:2">
					<a
						href={REPO}
						aria-label="Prisharp on GitHub"
						className="d:f ai:c jc:c w:8 h:8 br:lg c:label h:bg:well"
					>
						<Logo name="github" className="w:4 h:4" />
					</a>
					<ThemeSwitcher
						iconOnly
						size="sm"
						storageKey={THEME_KEY}
						onValueChange={onTheme}
					/>
				</div>
			</nav>
		</header>
	);
}
