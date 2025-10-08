import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import "./lib/i18n";
import { initializeDB } from "./lib/db";

// Initialize database with demo user
initializeDB();

createRoot(document.getElementById("root")!).render(<App />);
