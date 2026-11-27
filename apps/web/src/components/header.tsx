import Button from "@/components/ui/button";
import { Mark } from "@/components/mark";
import { FIREFOX } from "@/browser";
import { STORE } from "@/links";

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
			{FIREFOX ? (
				// the hero's install button, which warns before the zip downloads
				<Button
					onClick={() => document.getElementById("install")?.click()}
					size="sm"
					shape="none"
					className="us:none"
				>
					Download for Firefox
				</Button>
			) : (
				<Button
					render={<a href={STORE} />}
					nativeButton={false}
					size="sm"
					shape="none"
					className="us:none"
				>
					Add to Chrome
				</Button>
			)}
		</header>
	);
}
