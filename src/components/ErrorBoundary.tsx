// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // Logue se quiser
    console.error("ErrorBoundary capturou:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-center">
            <p className="text-lg font-semibold text-red-600">
              Algo deu errado ao renderizar esta seção.
            </p>
            <p className="text-slate-600 mt-2">
              Tente recarregar a página ou fechar e abrir o modal novamente.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
