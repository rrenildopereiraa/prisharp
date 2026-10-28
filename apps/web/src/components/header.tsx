import { useSound } from "sonics/react";
import Button from "@/components/ui/button";
import { SoundToggle } from "@/components/sound-toggle";
import { DOWNLOAD } from "@/links";

export function Header() {
	const tap = useSound("tap");

	return (
		<header className="d:f ai:c jc:sb g:4 h:14 px:4 @md:h:18 @md:px:8">
			<a
				href="/"
				className="ff:sans fw:600 ls:2 fs:xl @md:fs:xxl c:label td:none br:sm fv:os:s fv:ow:2 fv:oo:4 fv:oc:focus"
			>
				Prisharp
			</a>
			<div className="d:f ai:c g:2">
				<SoundToggle />
				<Button
					render={<a href={DOWNLOAD} download />}
					nativeButton={false}
					size="sm"
					className="us:none"
					onClick={() => tap()}
				>
					Download
				</Button>
			</div>
		</header>
	);
}
