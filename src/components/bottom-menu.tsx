import { FileUser, House, Newspaper, Receipt, CreditCard, Users, BookOpen, LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: ("secretary" | "admin" | "teacher" | "student")[];
}

const baseMenuItems: MenuItem[] = [
  { id: "home", path: "/", label: "Inicio", icon: House },
  { id: "users", path: "/users", label: "Usuários", icon: Users, roles: ["secretary", "admin"] },
  { id: "classes", path: "/classes", label: "Turmas", icon: BookOpen, roles: ["secretary", "admin", "teacher", "student"] },
  { id: "payment", path: "/payment", label: "Pagamento", icon: Receipt },
  { id: "feedback", path: "/feedback", label: "Feedback", icon: FileUser },
  { id: "news", path: "/news", label: "Noticias", icon: Newspaper },
  { id: "card", path: "/card", label: "Cartão", icon: CreditCard },
];

export function BottomMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Filtrar itens do menu baseado nas permissões do usuário
  const menuItems = baseMenuItems.filter((item) => {
    if (!item.roles) return true; // Item sem restrição de role
    return user && item.roles.includes(user.role as "secretary" | "admin" | "teacher" | "student");
  });

  function isActive(path: string) {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-stone-50 shadow-[0_-3px_2px_0_rgb(0,0,0,0.05)] h-[72px]">
      <div 
        className="flex items-center py-2 px-2 h-full overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center gap-1 min-w-max">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center min-w-[70px] px-2 py-1 rounded-lg transition-colors ${
                  active ? "bg-amber-100 font-bold" : "hover:bg-gray-200"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className={`w-5 h-5 ${active ? "text-amber-900" : "text-gray-700"}`} />
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? "text-amber-900 font-bold" : "text-gray-700"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
