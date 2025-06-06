import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-amber-900 flex items-center justify-center text-white border-2 border-amber-200 shadow">
          <User size={20} />
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">Leandro</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">Leandro</p>
            <p className="text-xs text-gray-500">leandro@email.com</p>
          </div>
          <div className="py-1">
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Settings size={16} className="mr-2" />
              Configurações
            </button>
            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              <LogOut size={16} className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 