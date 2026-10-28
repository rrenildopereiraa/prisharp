import { type FormEvent, useRef, useState } from "react";
import { useSound } from "sonics/react";
import Button from "@/components/ui/button";
import { toAddress } from "@/address";
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
	const [rejected, setRejected] = useState<string>();
	const [shake, setShake] = useState(false);
	const field = useRef<HTMLInputElement>(null);
	const click = useSound("click");
	const tap = useSound("tap");
	const fail = useSound("error");
	const error =
		rejected ?? (lookup.state === "error" ? lookup.message : undefined);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const target = toAddress(address);
		if (!target) {
			fail();
			setRejected(
				rejected
					? "That is still not a web address."
					: "That is not a web address.",
			);
			field.current?.focus();
			setShake(true);
			return;
		}
		click();
		setRejected(undefined);
		setShake(false);
		onLookup(target);
	};

	return (
		<div
			data-hero
			className="p:r d:f fd:c g:5 py:6 px:4 @md:py:12 @md:px:8 @lg:fg:1 @lg:min-w:0 @lg:pt:12"
		>
			<p className="m:0 ff:sans fw:500 fs:sm @md:fs:md c:hint">
				A browser extension for Chromium
			</p>
			<h1 className="m:0 ff:sans fw:600 fs:4xl @sm:fs:5xl @md:fs:6xl lh:1 ls:1">
				What is this site
				<br /> built with?
			</h1>
			<p className="m:0 max-w:120 fs:sm c:hint lh:5 tw:p">
				Prisharp will show you all the frameworks, libraries and hosts used on
				the page, with evidence for each.
			</p>
			<div data-actions className="d:none fw:w g:2 mt:1 @md:d:f">
				<Button
					id="download"
					render={<a href={DOWNLOAD} download />}
					nativeButton={false}
					title="Unzip it, then load the folder unpacked from chrome://extensions"
					className={ACTION}
					onClick={() => tap()}
				>
					Download for Chromium <Key>D</Key>
				</Button>
				<Button
					id="source"
					variant="secondary"
					render={<a href={REPO} />}
					nativeButton={false}
					className={ACTION}
					onClick={() => tap()}
				>
					View source <Key>S</Key>
				</Button>
			</div>
			<form onSubmit={submit} className="d:f fd:c g:2 max-w:120 mt:3 @md:mt:5">
				<label htmlFor="address" className="fs:xs c:hint us:none">
					Try a site, no install needed
				</label>
				<div
					onAnimationEnd={(event) => {
						if (event.target === event.currentTarget) setShake(false);
					}}
					className={`d:f ai:c g:2 h:11 pl:3 pr:1 br:md bw:1 bg:field tp:a tdu:150 @prm:tp:none fw:os:s fw:ow:3 fw:oo:0 ${
						error
							? "bc:red-7 fw:oc:red-7/40 fw:bc:red-7"
							: "bc:edge fw:oc:focus/40 fw:bc:focus"
					} ${shake ? "an:shake adu:300 atf:io @prm:an:none" : ""}`}
				>
					<input
						id="address"
						name="address"
						ref={field}
						type="text"
						inputMode="url"
						enterKeyHint="go"
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="off"
						spellCheck={false}
						placeholder="renildo.dev"
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? "address-error" : undefined}
						value={address}
						onChange={(event) => {
							setAddress(event.target.value);
							if (rejected) setRejected(undefined);
						}}
						className="fg:1 min-w:0 h:100% p:0 bw:0 bg:transparent c:label ff:mono fs:md @md:fs:sm f:os:none"
					/>
					<Button
						type="submit"
						size="sm"
						variant="subtle"
						focus="fv:os:none fv:bc:transparent fv:bg:rim"
						loading={lookup.state === "loading" && lookup.asked}
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
