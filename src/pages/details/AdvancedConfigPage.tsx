// src/pages/details/AdvancedConfigPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/http";
import type { AppDetails } from "./types";

import { ServerHostSection } from "./components/advanced/ServerHostSection";
import { HealthMonitorSection } from "./components/advanced/HealthMonitorSection";
import { AppEndpointSection } from "./components/advanced/AppEndpointSection";

export default function AdvancedConfigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<AppDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data } = await api.get(`/apps/${id}`);
        if (!ignore) setApp(data);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
        <p className="text-sm text-slate-500">
          Carregando configurações avançadas…
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <p className="text-sm text-red-500">App não encontrado.</p>
      </div>
    );
  }

  const appTitle = app.nome ?? app.name ?? app.id;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para detalhes
      </button>

      <h1 className="text-lg font-semibold text-slate-900">
        Configurações avançadas – {appTitle}
      </h1>

      <ServerHostSection app={app} />
      <HealthMonitorSection app={app} />
      <AppEndpointSection app={app} />
    </div>
  );
}
