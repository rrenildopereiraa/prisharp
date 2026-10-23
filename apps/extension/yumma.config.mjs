import { defineConfig } from "yummacss";
import site from "../web/yumma.config.mjs";

// The site's theme, which is Yumma UI's own, so the popup and prisharp.com
// share every color, easing and state.
export default defineConfig({
	...site,
	source: ["./popup.html", "./src/**/*.js"],
	output: "./popup.css",
});
