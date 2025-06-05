import { FileUser, House, Newspaper, Receipt, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export function SideMenu() {
  const navigate = useNavigate();

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

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-stone-50 shadow-lg fixed left-0 top-0">
      <div className="border-b border-gray-200 flex justify-center">
        <img src={logo} alt="Aconchego" className="h-28" />
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-200 group"
              onClick={() => goToPage("home")}
            >
              <House className="w-5 h-5 text-purple-700" />
              <span className="ml-3">Início</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-200 group"
              onClick={() => goToPage("payment")}
            >
              <Receipt className="w-5 h-5 text-gray-700" />
              <span className="ml-3">Pagamento</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-200 group"
              onClick={() => goToPage("feedback")}
            >
              <FileUser className="w-5 h-5 text-gray-700" />
              <span className="ml-3">Feedback</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-200 group"
              onClick={() => goToPage("news")}
            >
              <Newspaper className="w-5 h-5 text-gray-700" />
              <span className="ml-3">Notícias</span>
            </button>
          </li>
          <li>
            <button
              className="flex items-center w-full p-2 text-gray-700 rounded-lg hover:bg-gray-200 group"
              onClick={() => goToPage("card")}
            >
              <CreditCard className="w-5 h-5 text-gray-700" />
              <span className="ml-3">Cartão</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
} 