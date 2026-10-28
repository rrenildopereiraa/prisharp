import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SonicsProvider } from "sonics/react";
import "./styles.css";
import { App } from "./app";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<SonicsProvider>
			<App />
		</SonicsProvider>
	</StrictMode>,
);
