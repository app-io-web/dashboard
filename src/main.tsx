// src/main.tsx  (ou index.tsx, o mesmo arquivo que você colou)
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// ← AQUI: importa o wireAuth
import { wireAuth } from "@/lib/http";

// ← AQUI: chama ele uma única vez, antes de renderizar tudo
wireAuth();   // <------------------------ ESSA LINHA RESOLVE TUDO

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);