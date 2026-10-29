import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonicsProvider } from "sonics/react";
import { TooltipProvider } from "@/components/tooltip";
import "./styles.css";
import { App } from "./app";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<SonicsProvider>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</SonicsProvider>
	</StrictMode>,
);
