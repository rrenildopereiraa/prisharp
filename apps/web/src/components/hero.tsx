import { type FormEvent, useState } from "react";
import Button from "@/components/ui/button";
import { DOWNLOAD, REPO } from "@/links";
import type { Lookup } from "@/lookup";

function Key({ children }: { children: string }) {
	return (
		<kbd
			aria-hidden="true"
			className="d:if ai:c jc:c h:4 min-w:4 px:1 br:sm bw:1 bc:current o:70 ff:mono fs:xs lh:1"
		>
			{children}
		</kbd>
	);
}

// the hero's buttons: the mockup's 40px height and 6px corners
const ACTION = "h:10 px:4 g:2 br:md fs:sm us:none";

export function Hero({
	lookup,
	onLookup,
}: {
	lookup: Lookup;
	onLookup: (address: string) => void;
}) {
	const [address, setAddress] = useState("");
	const error = lookup.state === "error" ? lookup.message : undefined;

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (address.trim()) onLookup(address.trim());
	};

	return (
		<div className="d:f fd:c g:5 py:6 px:4 @md:py:12 @md:px:8 @lg:fg:1 @lg:min-w:0 @lg:pt:16">
			<p className="m:0 ff:serif fs:sm @md:fs:md fs:i c:hint">
				A browser extension for Chromium
			</p>
			<h1
				data-display
				className="m:0 ff:serif fw:400 fs:4xl @sm:fs:5xl @md:fs:6xl lh:1 ls:2"
			>
				What is this site
				<br />
				<i>built with?</i>
			</h1>
			<p className="m:0 max-w:120 fs:sm c:hint lh:5 tw:p">
				Prisharp will show you all the frameworks, libraries and hosts used on
				the page, with evidence for each.
			</p>
			<div className="d:none fw:w g:2 mt:1 @md:d:f">
				<Button
					id="download"
					render={<a href={DOWNLOAD} download />}
					nativeButton={false}
					title="Unzip it, then load the folder unpacked from chrome://extensions"
					className={ACTION}
				>
					Download for Chromium <Key>D</Key>
				</Button>
				<Button
					id="source"
					variant="secondary"
					render={<a href={REPO} />}
					nativeButton={false}
					className={ACTION}
				>
					View source <Key>S</Key>
				</Button>
			</div>
			<form onSubmit={submit} className="d:f fd:c g:2 max-w:120 mt:3 @md:mt:5">
				<label htmlFor="address" className="fs:xs c:hint us:none">
					Try a site, no install needed
				</label>
				<div className="d:f ai:c g:2 h:11 pl:3 pr:1 br:md bw:1 bc:rim bg:field fw:os:s fw:ow:2 fw:oo:2 fw:oc:focus">
					<span aria-hidden="true" className="c:hint us:none">
						https://
					</span>
					<input
						id="address"
						name="address"
						type="text"
						inputMode="url"
						enterKeyHint="go"
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="url"
						spellCheck={false}
						placeholder="renildo.dev"
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? "address-error" : undefined}
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						className="fg:1 min-w:0 h:100% p:0 bw:0 bg:transparent c:label ff:mono fs:md @md:fs:sm f:os:none"
					/>
					<Button
						type="submit"
						size="sm"
						variant="subtle"
						loading={lookup.state === "loading"}
						className="fs:0 h:8 px:2 g:2 br:sm c:label ws:nw us:none"
					>
						Look it up <Key>↵</Key>
					</Button>
				</div>
				{error && (
					<p id="address-error" role="alert" className="m:0 fs:xs c:red-7">
						{error}
					</p>
				)}
			</form>
		</div>
	);
}
