import { categories, technologies } from "extension/technologies";
import Badge from "@/components/ui/badge";
import Tooltip from "@/components/ui/tooltip";
import { hasLogo, Logo } from "./logo";

interface Signal {
	js?: string;
	jsPrefix?: string;
	domKey?: string;
	attrPrefix?: string;
	dom?: string;
	resource?: RegExp;
	meta?: [string, RegExp];
	header?: [string, RegExp];
	classes?: string[];
	css?: RegExp;
	script?: RegExp;
	file?: string;
	found?: string[];
}

const plain = (regex: RegExp) =>
	regex.source.replace(/\\/g, "").replace(/\(\?:|[()^$]/g, "");

// a signal as a reader would look for it in DevTools
function evidence(signal: Signal): string {
	if (signal.file) return `${signal.file} on a dev server`;
	if (signal.found) return `${signal.found.join(" + ")} together`;
	if (signal.js) return `window.${signal.js}`;
	if (signal.jsPrefix) return `window.${signal.jsPrefix}…`;
	if (signal.domKey) return `${signal.domKey}… on elements`;
	if (signal.attrPrefix) return `${signal.attrPrefix}* attributes`;
	if (signal.dom) return signal.dom.split(",")[0]?.trim() ?? signal.dom;
	if (signal.resource) return plain(signal.resource);
	if (signal.meta) return `<meta name="${signal.meta[0]}">`;
	if (signal.header) return `${signal.header[0]} header`;
	if (signal.classes) return `class="${signal.classes.join(" ")}"`;
	if (signal.css) return "its stylesheet";
	if (signal.script) return `${plain(signal.script).split("|")[0]} in a script`;
	return "the page";
}

export function TechList() {
	return (
		<div className="d:f fd:c g:8 my:6">
			{categories.map((category) => (
				<section key={category} className="d:f fd:c g:3">
					<h3 className="m:0 fs:sm fw:600 c:hint">{category}</h3>
					<ul className="d:f fw:w g:2 m:0 p:0">
						{technologies
							.filter((tech) => tech.category === category)
							.map((tech) => (
								<li key={tech.id}>
									<Tooltip
										className="w:auto h:auto br:9999 h:bg:transparent"
										trigger={
											<Badge
												size="lg"
												shape="pill"
												icon={
													hasLogo(tech.icon ?? tech.id) ? (
														<Logo
															name={tech.icon ?? tech.id}
															className="w:4 h:4"
														/>
													) : undefined
												}
											>
												{tech.name}
											</Badge>
										}
										content={
											<span className="d:f fd:c g:1 ff:m fs:xs">
												{(tech.signals as Signal[])
													.slice(0, 3)
													.map((signal) => (
														<span key={evidence(signal)}>
															{evidence(signal)}
														</span>
													))}
											</span>
										}
									/>
								</li>
							))}
					</ul>
				</section>
			))}
		</div>
	);
}
