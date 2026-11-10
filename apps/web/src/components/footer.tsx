import { GITHUB } from "@/links";

const LINK = "c:hint td:none h:c:label fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

export function Footer() {
	return (
		<footer className="d:f ai:c jc:sb g:4 py:4 px:4 fs:xs c:hint @md:h:16 @md:py:0 @md:px:8">
			<p className="m:0">© 2026 Prisharp · MIT License</p>
			<nav className="d:f g:5">
				<a href="/privacy/" className={LINK}>
					Privacy
				</a>
				<a href={GITHUB} className={LINK}>
					GitHub
				</a>
			</nav>
		</footer>
	);
}
