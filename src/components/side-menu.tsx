import { FileUser, House, Newspaper, Receipt, CreditCard, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

export function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  function goToPage(page: string) {
    switch (page) {
      case "home":
        navigate("/");
        break;
      case "payment":
        navigate("/payment");
        break;
      case "feedback":
        navigate("/feedback");
        break;
      case "news":
        navigate("/news");
        break;
      case "card":
        navigate("/card");
        break;
      case "users":
        navigate("/users");
        break;
    }
  }

  function isActive(path: string) {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-stone-50 shadow-lg fixed left-0 top-0">
      <div className="border-b border-gray-200 flex justify-center">
        <img src={logo} alt="Aconchego" className="h-28" />
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                isActive("/")
                  ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                  : "text-gray-700 hover:bg-gray-200 border-l-transparent"
              }`}
              onClick={() => goToPage("home")}
            >
              <House className={`w-5 h-5 ${isActive("/") ? "text-amber-900" : "text-gray-700"}`} />
              <span className="ml-3">Início</span>
            </button>
          </li>
          {(user?.role === "secretary" || user?.role === "admin") && (
            <li>
              <button
                className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                  isActive("/users")
                    ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                    : "text-gray-700 hover:bg-gray-200 border-l-transparent"
                }`}
                onClick={() => goToPage("users")}
              >
                <Users className={`w-5 h-5 ${isActive("/users") ? "text-amber-900" : "text-gray-700"}`} />
                <span className="ml-3">Usuários</span>
              </button>
            </li>
          )}
          <li>
            <button
              className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                isActive("/payment")
                  ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                  : "text-gray-700 hover:bg-gray-200 border-l-transparent"
              }`}
              onClick={() => goToPage("payment")}
            >
              <Receipt className={`w-5 h-5 ${isActive("/payment") ? "text-amber-900" : "text-gray-700"}`} />
              <span className="ml-3">Pagamento</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                isActive("/feedback")
                  ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                  : "text-gray-700 hover:bg-gray-200 border-l-transparent"
              }`}
              onClick={() => goToPage("feedback")}
            >
              <FileUser className={`w-5 h-5 ${isActive("/feedback") ? "text-amber-900" : "text-gray-700"}`} />
              <span className="ml-3">Feedback</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                isActive("/news")
                  ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                  : "text-gray-700 hover:bg-gray-200 border-l-transparent"
              }`}
              onClick={() => goToPage("news")}
            >
              <Newspaper className={`w-5 h-5 ${isActive("/news") ? "text-amber-900" : "text-gray-700"}`} />
              <span className="ml-3">Notícias</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center w-full p-2 rounded-lg group border-l-4 ${
                isActive("/card")
                  ? "text-amber-900 hover:bg-amber-100 border-l-amber-900 bg-amber-100 font-bold"
                  : "text-gray-700 hover:bg-gray-200 border-l-transparent"
              }`}
              onClick={() => goToPage("card")}
            >
              <CreditCard className={`w-5 h-5 ${isActive("/card") ? "text-amber-900" : "text-gray-700"}`} />
              <span className="ml-3">Cartão</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
} 