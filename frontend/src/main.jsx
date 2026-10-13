import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { warmUpBackend } from "./utils/warmup.js";

warmUpBackend(); // starts waking Render immediately, before React mounts

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
