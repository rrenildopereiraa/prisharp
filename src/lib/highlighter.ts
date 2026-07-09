import {
	createHighlighterCore,
	type HighlighterCore,
	type ThemeInput,
} from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

import astro from "@shikijs/langs/astro";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import mdx from "@shikijs/langs/mdx";
import php from "@shikijs/langs/php";
import scss from "@shikijs/langs/scss";
import svelte from "@shikijs/langs/svelte";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import vue from "@shikijs/langs/vue";

import eclipsa from "./eclipsa-theme.json";

export const LANGUAGES = {
	html: "HTML",
	javascript: "JavaScript",
	jsx: "JSX",
	typescript: "TypeScript",
	tsx: "TSX",
	astro: "Astro",
	vue: "Vue",
	svelte: "Svelte",
	markdown: "Markdown",
	mdx: "MDX",
	css: "CSS",
	scss: "SCSS",
	php: "PHP",
} as const;

export type LanguageId = keyof typeof LANGUAGES;

export const THEME_NAME = eclipsa.name;

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighterCore({
			themes: [eclipsa as unknown as ThemeInput],
			langs: [
				astro,
				css,
				html,
				javascript,
				jsx,
				markdown,
				mdx,
				php,
				scss,
				svelte,
				tsx,
				typescript,
				vue,
			],
			engine: createJavaScriptRegexEngine(),
		});
	}
	return highlighterPromise;
}
