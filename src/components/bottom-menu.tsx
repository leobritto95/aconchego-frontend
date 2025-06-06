import { FileUser, House, Newspaper, Receipt, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function BottomMenu() {
  const navigate = useNavigate();
  const location = useLocation();

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
    }
  }

  function isActive(path: string) {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex justify-around items-center p-2 bg-stone-50 shadow-[0_-3px_2px_0_rgb(0,0,0,0.05)]">
        <button
          className={`flex flex-col items-center flex-1 p-1 ${
            isActive("/")
              ? "bg-amber-100 font-bold"
              : "hover:bg-gray-200"
          }`}
          onClick={() => goToPage("home")}
        >
          <House className={isActive("/") ? "text-amber-900" : "text-gray-700"} />
          <span className={`text-sm mt-1 ${isActive("/") ? "text-amber-900 font-bold" : "text-gray-700"}`}>
            Inicio
          </span>
        </button>
        <button 
          className={`flex flex-col items-center flex-1 p-1 ${
            isActive("/payment")
              ? "bg-amber-100 font-bold"
              : "hover:bg-gray-200"
          }`}
          onClick={() => goToPage("payment")}
        >
          <Receipt className={isActive("/payment") ? "text-amber-900" : "text-gray-700"} />
          <span className={`text-sm mt-1 ${isActive("/payment") ? "text-amber-900 font-bold" : "text-gray-700"}`}>
            Pagamento
          </span>
        </button>
        <button
          className={`flex flex-col items-center flex-1 p-1 ${
            isActive("/feedback")
              ? "bg-amber-100 font-bold"
              : "hover:bg-gray-200"
          }`}
          onClick={() => goToPage("feedback")}
        >
          <FileUser className={isActive("/feedback") ? "text-amber-900" : "text-gray-700"} />
          <span className={`text-sm mt-1 ${isActive("/feedback") ? "text-amber-900 font-bold" : "text-gray-700"}`}>
            Feedback
          </span>
        </button>
        <button
          className={`flex flex-col items-center flex-1 p-1 ${
            isActive("/news")
              ? "bg-amber-100 font-bold"
              : "hover:bg-gray-200"
          }`}
          onClick={() => goToPage("news")}
        >
          <Newspaper className={isActive("/news") ? "text-amber-900" : "text-gray-700"} />
          <span className={`text-sm mt-1 ${isActive("/news") ? "text-amber-900 font-bold" : "text-gray-700"}`}>
            Noticias
          </span>
        </button>
        <button 
          className={`flex flex-col items-center flex-1 p-1 ${
            isActive("/card")
              ? "bg-amber-100 font-bold"
              : "hover:bg-gray-200"
          }`}
          onClick={() => goToPage("card")}
        >
          <CreditCard className={isActive("/card") ? "text-amber-900" : "text-gray-700"} />
          <span className={`text-sm mt-1 ${isActive("/card") ? "text-amber-900 font-bold" : "text-gray-700"}`}>
            Cartão
          </span>
        </button>
      </div>
    </div>
  );
}
