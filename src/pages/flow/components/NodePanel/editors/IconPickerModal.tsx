// pages/flow/components/NodePanel/editors/IconPickerModal.tsx
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { icons } from "lucide-react"; // ← IMPORT CORRETO!

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

export default function IconPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentIcon,
}: IconPickerModalProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // CORRETO: usa o objeto `icons` exportado diretamente
  const allIcons = Object.keys(icons).sort();

  const filteredIcons = allIcons.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen) setSearch("");
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Escolher Ícone Lucide
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-lg transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Busca */}
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar ícone... (ex: Globe, User, Settings)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {filteredIcons.length} de {allIcons.length} ícones
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum ícone encontrado para "<strong>{search}</strong>"
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
              {filteredIcons.map((iconName) => {
                const IconComponent = icons[iconName as keyof typeof icons];
                const isSelected = currentIcon === iconName;

                return (
                  <button
                    key={iconName}
                    onClick={() => onSelect(iconName)}
                    title={iconName}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md scale-110"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm hover:scale-105"
                      }`}
                  >
                    <IconComponent className="w-7 h-7 text-gray-700" />
                    <span className="text-[10px] mt-1 text-gray-600 font-medium truncate w-full">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}