import { FileUser, House, Newspaper, Receipt, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BottomMenu() {
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
    <div className="fixed bottom-0 left-0 right-0">
      <div className="flex justify-around items-center p-2 bg-stone-50 shadow-[0_-3px_2px_0_rgb(0,0,0,0.05)]">
        <button
          className="flex flex-col items-center flex-1 p-1 hover:bg-gray-200"
          onClick={() => goToPage("home")}
        >
          <House className="text-purple-700" />
          <span className="text-sm mt-1 text-purple-700 font-medium">
            Inicio
          </span>
        </button>
        <button className="flex flex-col items-center flex-1 p-1 hover:bg-gray-200">
          <Receipt />
          <span className="text-sm mt-1 text-gray-700">Pagamento</span>
        </button>
        <button
          className="flex flex-col items-center flex-1 p-1 hover:bg-gray-200"
          onClick={() => goToPage("feedback")}
        >
          <FileUser />
          <span className="text-sm mt-1 text-gray-700">Feedback</span>
        </button>
        <button
          className="flex flex-col items-center flex-1 p-1 hover:bg-gray-200"
          onClick={() => goToPage("news")}
        >
          <Newspaper />
          <span className="text-sm mt-1 text-gray-700">Noticias</span>
        </button>
        <button className="flex flex-col items-center flex-1 p-1 hover:bg-gray-200">
          <CreditCard />
          <span className="text-sm mt-1 text-gray-700">Cartão</span>
        </button>
      </div>
    </div>
  );
}
