// src/components/onboarding/OnboardingModal.tsx
import { useNavigate } from "react-router-dom";
import { Rocket, PartyPopper, Sparkles } from "lucide-react";

type Props = {
  smtpOk: boolean;
  hasEmpresa: boolean;
  onClose: () => void;
};

export default function OnboardingModal({ smtpOk, hasEmpresa, onClose }: Props) {
  const navigate = useNavigate();

  const missingSmtp = !smtpOk;
  const missingEmpresa = smtpOk && !hasEmpresa;

  const step =
    missingSmtp ? 1 :
    missingEmpresa ? 2 :
    2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[380px] rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="text-xs font-medium text-gray-400 mb-2">
          Onboarding • Passo {step} de 2
        </div>

        {missingSmtp && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              Vamos deixar tudo pronto <Rocket className="w-5 h-5 text-blue-600" />
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Primeiro, configure o envio de e-mails (SMTP).  
              É assim que o sistema manda convites, alertas e notificações importantes.
            </p>

            <button
              type="button"
              onClick={() => navigate("/config/smtp")}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-[0.99] transition"
            >
              Configurar SMTP
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              Agora não
            </button>
          </>
        )}

        {missingEmpresa && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              SMTP pronto, bora pro próximo <PartyPopper className="w-5 h-5 text-blue-600" />
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Agora cadastre sua primeira empresa para começar a criar apps e fluxos.
            </p>

            <button
              type="button"
              onClick={() => navigate("/empresas/nova")}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-[0.99] transition"
            >
              Cadastrar empresa
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              Depois eu vejo isso
            </button>
          </>
        )}

        {!missingSmtp && !missingEmpresa && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              Tudo configurado <Sparkles className="w-5 h-5 text-blue-600" />
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Seu ambiente já está pronto. Agora é só criar apps, fluxos e mandar ver.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-black active:scale-[0.99] transition"
            >
              Começar a usar o painel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
