import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/tooltip";
import "./styles.css";
import { App } from "./app";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<TooltipProvider>
			<App />
		</TooltipProvider>
	</StrictMode>,
);
