import { Check, X } from "lucide-react";
import { BottomMenu } from "../components/bottom-menu";
import { ListboxComponent } from "../components/list-box-component";
import { useNavigate } from "react-router-dom";

export function Feedback() {
  const navigate = useNavigate();

  function goToFeedbackDetails(feedbackId: number) {
    navigate(`/feedback/${feedbackId}`);
  }

  return (
    <main className="h-screen flex flex-col items-center pt-4">
      <h1 className="text-2xl">Histórico de Feedbacks</h1>
      <div className="p-4 w-full">
        <span className="text-base font-semibold">Estilos</span>
        <ListboxComponent />
      </div>
      <div className="pt-2 p-4 w-full">
        <span className="text-base font-semibold">Ano</span>
        <ListboxComponent />
      </div>
      <div className="w-full p-4 text-center">
        <table className="border-collapse border border-slate-500 w-full">
          <thead>
            <tr>
              <th className="border border-slate-600 p-2">Estilo</th>
              <th className="border border-slate-600">Turma</th>
              <th className="border border-slate-600">Data</th>
              <th className="border border-slate-600">Nota</th>
              <th className="border border-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => goToFeedbackDetails(1)}
            >
              <td className="border border-slate-700 p-2">Forró</td>
              <td className="border border-slate-700">X</td>
              <td className="border border-slate-700">06/10/2024</td>
              <td className="border border-slate-700">2,6</td>
              <td className="border border-slate-700">
                <X className="text-red-600 mx-auto" />
              </td>
            </tr>
            <tr
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => goToFeedbackDetails(2)}
            >
              <td className="border border-slate-700 p-2">Forró</td>
              <td className="border border-slate-700">X</td>
              <td className="border border-slate-700">06/10/2024</td>
              <td className="border border-slate-700">4</td>
              <td className="border border-slate-700">
                <Check className="text-green-600 mx-auto" />
              </td>
            </tr>
            <tr
              className="cursor-pointer hover:bg-gray-300"
              onClick={() => goToFeedbackDetails(3)}
            >
              <td className="border border-slate-700 p-2">Jazz</td>
              <td className="border border-slate-700">Z</td>
              <td className="border border-slate-700">10/12/2024</td>
              <td className="border border-slate-700">2</td>
              <td className="border border-slate-700">
                <X className="text-red-600 mx-auto" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BottomMenu />
    </main>
  );
}
