import Button from "@/components/ui/button";
import { Mark } from "@/components/mark";
import { FIREFOX, UNSUPPORTED } from "@/browser";

export function Header() {
	return (
		<header className="d:f ai:c jc:sb g:4 h:14 px:4 @md:h:18 @md:px:8">
			<a
				href="/"
				className="d:f ai:c g:3 c:label td:none fv:os:s fv:ow:2 fv:oo:4 fv:oc:focus"
			>
				<Mark className="h:6 w:5" />
				<span className="ff:sans fw:400 ls:2 fs:xl @md:fs:xxl">Prisharp</span>
			</a>
			<nav className="d:f ai:c g:5">
				<a
					href="/docs/"
					className="fs:xs c:hint td:none h:c:label fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus"
				>
					Docs
				</a>
				{!UNSUPPORTED && (
					// the hero's button, which opens where to get it from; on a page
					// without one, the browsers page says the same
					<Button
						onClick={() => {
							const install = document.getElementById("install");
							if (install) install.click();
							else location.href = "/docs/browsers/";
						}}
						size="sm"
						shape="none"
						className="us:none"
					>
						{FIREFOX ? "Add to Firefox" : "Add to Chrome"}
					</Button>
				)}
			</nav>
		</header>
	);
}
