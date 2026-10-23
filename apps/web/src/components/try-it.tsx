import { MagnifierIcon } from "@solar-icons/react/outline";
import { type FormEvent, useState } from "react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import { hasLogo, Logo } from "./logo";

interface Found {
	id: string;
	name: string;
	version?: string;
	category: string;
	website: string;
	icon: string;
}

type Result =
	| { state: "idle" }
	| { state: "loading" }
	| { state: "done"; host: string; technologies: Found[] }
	| { state: "error"; message: string };

/** The extension's detection, run on the server for a page you name. */
export function TryIt() {
	const [address, setAddress] = useState("");
	const [result, setResult] = useState<Result>({ state: "idle" });

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!address.trim()) return;
		setResult({ state: "loading" });
		try {
			const response = await fetch(
				`/api/detect?url=${encodeURIComponent(address.trim())}`,
			);
			const body = await response.json();
			if (!response.ok) throw new Error(body.error);
			setResult({
				state: "done",
				host: new URL(body.url).hostname.replace(/^www\./, ""),
				technologies: body.technologies,
			});
		} catch (error) {
			setResult({
				state: "error",
				message:
					error instanceof Error && error.message
						? error.message
						: "Something went wrong. Try again.",
			});
		}
	};

	return (
		<div className="d:f fd:c g:5 my:6">
			<form onSubmit={submit} className="d:f fd:c g:3 @sm:fd:r @sm:ai:fs">
				<div className="fg:1">
					<Field
						aria-label="Website"
						placeholder="yummacss.com"
						type="text"
						enterKeyHint="go"
						inputMode="url"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						size="lg"
						icon={<MagnifierIcon className="w:4 h:4" />}
						className="w:100%"
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						error={result.state === "error" ? result.message : undefined}
					/>
				</div>
				<Button type="submit" size="lg" loading={result.state === "loading"}>
					Detect
				</Button>
			</form>

			{result.state === "done" && (
				<div className="d:f fd:c g:3">
					{result.technologies.length === 0 ? (
						<p className="m:0 fs:sm c:hint">
							Nothing detected on {result.host}.
						</p>
					) : (
						<>
							<ul className="d:f fw:w g:2 m:0 p:0">
								{result.technologies.map((tech) => (
									<li key={tech.id}>
										<a href={tech.website} className="td:none">
											<Badge
												size="lg"
												shape="pill"
												icon={
													hasLogo(tech.icon) ? (
														<Logo name={tech.icon} className="w:4 h:4" />
													) : undefined
												}
											>
												{[tech.name, tech.version].filter(Boolean).join(" ")}
											</Badge>
										</a>
									</li>
								))}
							</ul>
							<p className="m:0 fs:sm c:hint">
								{result.technologies.length} on {result.host}
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
