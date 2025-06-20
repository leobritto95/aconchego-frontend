import { Users } from "lucide-react";
import { GroupedClasses } from "../services/feedbackService";

interface FeedbackStudentGroupedViewProps {
  groupedClasses: GroupedClasses[];
  isLoading?: boolean;
  onClassClick: (groupId: string) => void;
}

export function FeedbackStudentGroupedView({
  groupedClasses,
  isLoading = false,
  onClassClick,
}: FeedbackStudentGroupedViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando turmas...</p>
        </div>
      </div>
    );
  }

  if (groupedClasses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhuma turma encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedClasses.map((turma) => (
        <div
          key={`${turma.classId}-${turma.style}-${turma.date}`}
          className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() =>
            onClassClick(`${turma.classId}-${turma.style}-${turma.date}`)
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-amber-900 mr-3" />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {turma.className}
                </h3>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                  <p className="text-sm">
                    {new Date(turma.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Feedbacks</p>
              <p className="text-xl font-bold text-amber-900">
                {turma.feedbackCount}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
