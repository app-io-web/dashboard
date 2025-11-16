import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Apps</h1>
      <button
        onClick={() => navigate("/novo")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
      >
        <Plus size={18} />
        Novo App
      </button>
    </header>
  );
}
