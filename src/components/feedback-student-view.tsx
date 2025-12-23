import { Check, X, Clock } from "lucide-react";
import { Feedback } from "../types";

interface FeedbackStudentViewProps {
  feedbacks: Feedback[];
  onFeedbackClick: (feedbackId: number) => void;
}

export function FeedbackStudentView({
  feedbacks,
  onFeedbackClick,
}: FeedbackStudentViewProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhum feedback encontrado.</p>
      </div>
    );
  }

  return (
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
        {feedbacks.map((feedback) => (
          <tr
            key={feedback.id}
            className="cursor-pointer hover:bg-gray-300"
            onClick={() => onFeedbackClick(feedback.id)}
          >
            <td className="border border-slate-700 p-2">{feedback.style}</td>
            <td className="border border-slate-700">{feedback.class}</td>
            <td className="border border-slate-700">
              {new Date(feedback.date).toLocaleDateString("pt-BR")}
            </td>
            <td className="border border-slate-700">
              {feedback.average.toFixed(1)}
            </td>
            <td className="border border-slate-700">
              {feedback.status === "approved" ? (
                <Check className="text-green-600 mx-auto" />
              ) : feedback.status === "pending" ? (
                <Clock className="text-yellow-600 mx-auto" />
              ) : (
                <X className="text-red-600 mx-auto" />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
