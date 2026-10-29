import { expect, it } from "vite-plus/test";
import { siteIn } from "./share";

it("reads the site out of a query string", () => {
	expect(siteIn("?site=tailwindcss.com")).toBe("https://tailwindcss.com/");
	expect(siteIn("?site=https://renildo.dev/docs")).toBe(
		"https://renildo.dev/docs",
	);
	expect(siteIn("?other=1&site=example.com")).toBe("https://example.com/");
});

it("names no site when the query does not", () => {
	expect(siteIn("")).toBeNull();
	expect(siteIn("?site=")).toBeNull();
	expect(siteIn("?site=hello world")).toBeNull();
	expect(siteIn("?site=ftp://example.com")).toBeNull();
	expect(siteIn("?other=1")).toBeNull();
});
