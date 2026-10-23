import { ArrowRightIcon, ArrowRightUpIcon } from "@solar-icons/react/outline";
import { useContext } from "react";
import Button from "@/components/ui/button";
import { REPO } from "@/links";
import { DarkContext } from "@/theme";

export function Hero() {
	const dark = useContext(DarkContext);
	return (
		<section id="top" className="d:f fd:c ai:c ta:c g:6 pt:14 pb:16 @md:pt:24">
			<img src="/icon.png" alt="" className="w:16 h:16" />
			<div className="d:f fd:c ai:c g:3">
				<h1 className="m:0 fs:3xl fw:700 c:label @md:fs:5xl">Prisharp</h1>
				<p className="m:0 max-w:120 fs:md lh:5 c:hint @md:fs:lg">
					See the tech behind any site, in one click. A Chromium extension that
					shows what a page is built with, and how it knows.
				</p>
			</div>
			<div className="d:f fw:w jc:c g:3">
				<Button
					size="lg"
					shape="pill"
					icon={<ArrowRightUpIcon className="w:4 h:4" />}
					iconPosition="trailing"
					nativeButton={false}
					render={<a href={REPO} />}
				>
					Get it on GitHub
				</Button>
				<Button
					variant="secondary"
					size="lg"
					shape="pill"
					icon={<ArrowRightIcon className="w:4 h:4" />}
					iconPosition="trailing"
					nativeButton={false}
					render={<a href="#how-it-works" />}
				>
					How it works
				</Button>
			</div>
			<img
				src={dark ? "/popup-dark.png" : "/popup-light.png"}
				alt="The Prisharp popup on a Next.js app: a pill of logos, Next.js lit up with its version, and the stack opened below."
				width={369}
				height={348}
				className="w:100% max-w:92 h:auto mt:6 br:xl bw:1 btc:rim blc:rim brc:rim bbc:shadow bs-o:md"
			/>
		</section>
	);
}
