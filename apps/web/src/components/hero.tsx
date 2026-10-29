import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSound } from "sonics/react";
import Button from "@/components/ui/button";
import { BrowserMarks } from "@/components/browsers";
import { Tooltip } from "@/components/tooltip";
import { toAddress } from "@/address";
import { DOWNLOAD, REPO } from "@/links";
import type { Lookup } from "@/lookup";
import { suggest, type Suggestion } from "@/suggest";

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

const UNZIP =
	"Unzip it, then load the folder unpacked from chrome://extensions";

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
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const field = useRef<HTMLInputElement>(null);
	const click = useSound("click");
	const tap = useSound("tap");
	const fail = useSound("error");
	const target = toAddress(address);
	const again = lookup.address === target && lookup.state !== "error";
	const options = open ? suggest(address) : [];
	const error =
		rejected ?? (lookup.state === "error" ? lookup.message : undefined);

	useEffect(() => {
		if (lookup.state === "error") setShake(true);
	}, [lookup]);

	const submit = (event: FormEvent) => {
		event.preventDefault();
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
		setOpen(false);
		setActive(-1);
		onLookup(target);
	};

	const choose = (suggestion: Suggestion) => {
		click();
		setRejected(undefined);
		setShake(false);
		setAddress(suggestion.host);
		setOpen(false);
		setActive(-1);
		onLookup(suggestion.address);
	};

	return (
		<div
			data-hero
			className="p:r d:f fd:c g:5 py:6 px:4 @md:py:12 @md:px:8 @lg:fg:1 @lg:min-w:0 @lg:pt:12"
		>
			<p className="m:0 d:f ai:c fw:w g:2 ff:sans fw:500 fs:sm @md:fs:md c:hint">
				<span>A browser extension for</span>
				<BrowserMarks />
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
				<Tooltip label={UNZIP}>
					<Button
						id="download"
						render={<a href={DOWNLOAD} download />}
						nativeButton={false}
						aria-description={UNZIP}
						className={ACTION}
						onClick={() => tap()}
					>
						Download for Chromium <Key>D</Key>
					</Button>
				</Tooltip>
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
				<div className="p:r">
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
							role="combobox"
							aria-autocomplete="list"
							aria-expanded={options.length > 0}
							aria-controls="address-suggestions"
							aria-activedescendant={
								active >= 0 ? `suggestion-${active}` : undefined
							}
							aria-invalid={error ? true : undefined}
							aria-describedby={error ? "address-error" : undefined}
							value={address}
							onFocus={() => setOpen(true)}
							onBlur={() => setOpen(false)}
							onChange={(event) => {
								setAddress(event.target.value);
								setActive(-1);
								setOpen(true);
								if (rejected) setRejected(undefined);
							}}
							onKeyDown={(event) => {
								if (!options.length) return;
								if (event.key === "ArrowDown") {
									event.preventDefault();
									setActive((index) => (index + 1) % options.length);
								} else if (event.key === "ArrowUp") {
									event.preventDefault();
									setActive((index) =>
										index <= 0 ? options.length - 1 : index - 1,
									);
								} else if (event.key === "Escape") {
									setOpen(false);
									setActive(-1);
								} else if (event.key === "Enter" && active >= 0) {
									event.preventDefault();
									choose(options[active]);
								}
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
							{again ? "Check again" : "Look it up"} <Key>↵</Key>
						</Button>
					</div>
					{options.length > 0 && (
						<ul
							id="address-suggestions"
							role="listbox"
							aria-label="Sites"
							className="p:a t:100% l:0 r:0 m:0 mt:1 p:1 zi:50 br:md bw:1 bc:line bg:raised bs-o:md"
						>
							{options.map((option, index) => (
								<li
									key={option.address}
									id={`suggestion-${index}`}
									role="option"
									aria-selected={index === active}
									onMouseDown={(event) => event.preventDefault()}
									onMouseEnter={() => setActive(index)}
									onClick={() => choose(option)}
									className={`d:f ai:c jc:sb g:3 px:2 py:1 br:sm fs:xs us:none c:p ${
										index === active ? "bg:well" : ""
									}`}
								>
									<span className="c:label">{option.name}</span>
									<span className="c:hint">{option.host}</span>
								</li>
							))}
						</ul>
					)}
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
