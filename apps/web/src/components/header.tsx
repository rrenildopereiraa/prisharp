import Button from "@/components/ui/button";
import { DOWNLOAD } from "@/links";

export function Header() {
	return (
		<header className="d:f ai:c jc:sb g:4 h:14 px:4 @md:h:18 @md:px:8">
			<a
				href="/"
				className="ff:serif fs:xl @md:fs:xxl c:label td:none br:sm fv:os:s fv:ow:2 fv:oo:4 fv:oc:focus"
			>
				Prisharp
			</a>
			<Button
				render={<a href={DOWNLOAD} download />}
				nativeButton={false}
				size="sm"
				className="us:none"
			>
				Download
			</Button>
		</header>
	);
}
