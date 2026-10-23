import Accordion from "@/components/ui/accordion";

export function Limits() {
	return (
		<Accordion
			className="my:6 max-w:100%"
			variant="bordered"
			multiple
			items={[
				{
					value: "vite-plus",
					title: "Vite+",
					content:
						"Vite+ builds with Vite and Rolldown, so its output is theirs. Prisharp shows Vite and Rolldown, which is what reached the browser.",
				},
				{
					value: "astro",
					title: "A static Astro site",
					content:
						"Without islands or the generator tag, Astro can ship plain HTML and CSS with nothing of Astro left in it.",
				},
				{
					value: "base-ui",
					title: "Base UI and Yumma UI",
					content:
						"Base UI marks its parts only while they are open, so a page at rest can hide it. Yumma UI is Base UI styled with Yumma CSS, so it hides with it.",
				},
				{
					value: "server",
					title: "The server",
					content:
						"The language, the database and the API behind a page never reach the browser. Hosts do, through the headers they add.",
				},
			]}
		/>
	);
}
