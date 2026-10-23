import Separator from "@/components/ui/separator";
import { SOCIALS } from "@/links";

export function Footer() {
	return (
		<footer className="max-w:256 w:100% mx:auto px:5 pb:10 @md:px:8">
			<Separator />
			<div className="d:f fd:c g:4 pt:6 @sm:fd:r @sm:jc:sb @sm:ai:c">
				<ul className="d:f fw:w cg:5 rg:2 m:0 p:0">
					{SOCIALS.map((social) => (
						<li key={social.label}>
							<a
								href={social.href}
								className="fs:sm c:hint td:none h:c:label tp:c tdu:150"
							>
								{social.label}
							</a>
						</li>
					))}
				</ul>
				<p className="m:0 fs:sm c:hint">
					MIT License. Made by Renildo Pereira.
				</p>
			</div>
		</footer>
	);
}
