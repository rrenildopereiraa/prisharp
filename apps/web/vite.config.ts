import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import react from "@vitejs/plugin-react";
import rehypeSlug from "rehype-slug";
import yummacss from "@yummacss/vite";
import remarkGfm from "remark-gfm";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [
		{
			enforce: "pre",
			...mdx({
				remarkPlugins: [remarkGfm],
				rehypePlugins: [
					rehypeSlug,
					[
						rehypeShiki,
						{
							themes: { light: "github-light", dark: "github-dark" },
							defaultColor: false,
						},
					],
				],
			}),
		},
		react({ include: /\.(mdx|tsx?)$/ }),
		yummacss(),
	],
});
