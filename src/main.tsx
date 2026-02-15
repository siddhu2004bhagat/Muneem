import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import "./lib/i18n";
import { initializeDB } from "./lib/db";

// Initialize database with demo user
initializeDB();

// Global error handler for Kiosk mode crashes
window.addEventListener('error', (event) => {
    document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>${event.message}</p>
      <pre>${event.filename}: ${event.lineno}</pre>
      <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">Reload App</button>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
    document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Unhandled Promise Rejection</h1>
      <p>${event.reason}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">Reload App</button>
    </div>
  `;
});

createRoot(document.getElementById("root")!).render(<App />);
