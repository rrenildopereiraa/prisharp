import { GITHUB } from "@/links";

export function Footer() {
	return (
		<footer className="d:f ai:c jc:sb g:4 py:4 px:4 fs:xs c:hint @md:h:16 @md:py:0 @md:px:8">
			<p className="m:0">© 2026 Prisharp · MIT License</p>
			<a
				href={GITHUB}
				className="c:hint td:none h:c:label fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
			>
				GitHub
			</a>
		</footer>
	);
}
