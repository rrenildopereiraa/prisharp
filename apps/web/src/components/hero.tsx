import { type FormEvent, useState } from "react";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import { DOWNLOAD, REPO } from "@/links";
import type { Lookup } from "@/lookup";

function Key({ children }: { children: string }) {
	return (
		<kbd
			aria-hidden="true"
			className="d:if ai:c jc:c h:4 px:1 br:sm bw:1 bc:current o:70 ff:mono fs:xs lh:1"
		>
			{children}
		</kbd>
	);
}

export function Hero({
	lookup,
	onLookup,
}: {
	lookup: Lookup;
	onLookup: (address: string) => void;
}) {
	const [address, setAddress] = useState("");

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (address.trim()) onLookup(address.trim());
	};

	return (
		<div className="d:f fd:c g:4 py:6 px:4 @md:g:5 @md:py:12 @md:px:8 @lg:py:16">
			<p className="m:0 ff:serif fs:sm @md:fs:md fs:i c:hint">
				A browser extension for Chromium
			</p>
			<h1 className="m:0 ff:serif fw:400 fs:4xl @sm:fs:5xl @md:fs:6xl lh:1 ls:2 tw:b">
				What is this site <i>built with?</i>
			</h1>
			<p className="m:0 max-w:120 fs:sm c:hint lh:5 tw:p">
				Prisharp will show you all the frameworks, libraries and hosts used on
				the page, with evidence for each.
			</p>
			<div className="d:none fd:c g:2 @md:d:f">
				<div className="d:f fw:w g:3">
					<Button
						id="download"
						render={<a href={DOWNLOAD} download />}
						nativeButton={false}
						className="us:none"
					>
						Download for Chromium <Key>D</Key>
					</Button>
					<Button
						id="source"
						variant="secondary"
						render={<a href={REPO} />}
						nativeButton={false}
						className="us:none"
					>
						View source <Key>S</Key>
					</Button>
				</div>
				<p className="m:0 fs:xs c:hint">
					Unzip it, then load the folder unpacked from chrome://extensions.
				</p>
			</div>
			<form onSubmit={submit} className="d:f ai:fe g:2 max-w:120">
				<div className="fg:1">
					<Field
						label="Try a site, no install needed"
						placeholder="renildo.dev"
						type="text"
						enterKeyHint="go"
						inputMode="url"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						size="lg"
						className="w:100% fs:md"
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						error={lookup.state === "error" ? lookup.message : undefined}
					/>
				</div>
				<Button
					type="submit"
					size="lg"
					variant="secondary"
					loading={lookup.state === "loading"}
					className="fs:0 ws:nw us:none"
				>
					Look it up
				</Button>
			</form>
		</div>
	);
}
