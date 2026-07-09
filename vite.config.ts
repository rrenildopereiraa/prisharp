import react from "@vitejs/plugin-react";
import yummacss from "@yummacss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), yummacss()],
});
