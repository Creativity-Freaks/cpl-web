import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import faviconUrl from "@/assets/cpl2026logo.png";

// Dynamically set favicon from assets so it works with Vite bundling
(() => {
	if (typeof document !== "undefined") {
		const linkId = "app-favicon";
		let link = document.querySelector<HTMLLinkElement>(`link#${linkId}`);
		if (!link) {
			link = document.createElement("link");
			link.id = linkId;
			link.rel = "icon";
			document.head.appendChild(link);
		}
		link.href = faviconUrl;
		link.type = "image/jpeg";
	}
})();

createRoot(document.getElementById("root")!).render(<App />);
