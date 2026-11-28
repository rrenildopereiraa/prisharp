import { Code, LINK, render, Section, Text } from "./layout";

render(
	"/docs/",
	"Every technology leaves traces in what a site sends to your browser. Prisharp looks for those traces, weighs them, and shows you what it found and why.",
	<>
		<Section title="What a piece of evidence is">
			<Text>
				A piece of evidence is one trace a technology leaves behind. It can be a
				name a framework gives itself on the page, like <Code>window.next</Code>{" "}
				for Next.js, an address its files are served from, like{" "}
				<Code>/_next/static/</Code>, a note a server adds to its answer, like{" "}
				<Code>x-vercel-id</Code> for Vercel, a tag a site builder writes into
				the page, or a comment at the top of a stylesheet. Prisharp keeps a list
				of these traces for every technology it knows. When you open a result in
				the popup, it shows the traces it found.
			</Text>
		</Section>

		<Section title="1. Collect">
			<Text>
				When you click Prisharp's icon, it reads the tab you are looking at,
				once. It notes the names the page's scripts leave behind, the elements
				and attributes on the page, the files it loaded and its meta tags. It
				asks the site again for the page's headers, and reads the page's scripts
				and stylesheets as text. Your browser has usually kept these already, so
				this is quick and nothing new is downloaded.
			</Text>
		</Section>

		<Section title="2. Score">
			<Text>
				Prisharp then checks each technology's traces against what it read. Each
				trace that matches adds to that technology's score, and a technology
				shows once its score is high enough. Most traces count in full, so one
				is enough on its own. A trace that other software could also leave
				counts half, so it needs a second trace beside it. That is why some
				evidence counts double: a trace only one technology leaves is worth
				twice one that could belong to several. The{" "}
				<a href="/docs/technologies/" className={LINK}>
					list of technologies
				</a>{" "}
				marks the traces that count half.
			</Text>
		</Section>

		<Section title="3. Relate">
			<Text>
				Some technologies are built on others. Next.js is built on React, so
				when Prisharp finds Next.js it brings in React too, even if React left
				no trace of its own. Some only make sense together: an icon set made for
				one component library is dropped unless that library is found as well.
				And some traces rule a technology out, so GitHub Pages is never shown on
				github.com itself.
			</Text>
		</Section>

		<Section title="What it can't see">
			<Text>
				A browser sees only what a site sends it. Code that runs on the site's
				own servers, and tools that build a site without leaving a mark in what
				they build, can't be seen from a browser. When a site is built with a
				tool that hands its work to others, Prisharp shows those others.
			</Text>
		</Section>

		<Section title="Where it happens">
			<Text>
				All of this happens in your browser, only when you click, and only on
				that tab. Nothing is sent anywhere. The{" "}
				<a href="/privacy/" className={LINK}>
					privacy page
				</a>{" "}
				says exactly what Prisharp reads.
			</Text>
		</Section>
	</>,
);
