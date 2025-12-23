import { FileUser, House, Newspaper, Receipt, CreditCard, LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { id: "home", path: "/", label: "Inicio", icon: House },
  { id: "payment", path: "/payment", label: "Pagamento", icon: Receipt },
  { id: "feedback", path: "/feedback", label: "Feedback", icon: FileUser },
  { id: "news", path: "/news", label: "Noticias", icon: Newspaper },
  { id: "card", path: "/card", label: "Cartão", icon: CreditCard },
];

export function BottomMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path: string) {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-stone-50 shadow-[0_-3px_2px_0_rgb(0,0,0,0.05)] h-[72px]">
      <div className="flex justify-around items-center py-2 px-2 h-full">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center flex-1 p-1 ${
                active ? "bg-amber-100 font-bold" : "hover:bg-gray-200"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className={active ? "text-amber-900" : "text-gray-700"} />
              <span className={`text-sm mt-1 ${active ? "text-amber-900 font-bold" : "text-gray-700"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
