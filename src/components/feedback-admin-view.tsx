import { Users, Music } from "lucide-react";

interface GroupedClass {
  classId: number;
  className: string;
  style: string;
  date: string;
  feedbackCount: number;
}

interface FeedbackAdminViewProps {
  groupedClasses: GroupedClass[];
  isLoading: boolean;
  selectedStyle: string;
  selectedClass: string;
  onClassClick: (classId: number) => void;
}

export function FeedbackAdminView({
  groupedClasses,
  isLoading,
  selectedStyle,
  selectedClass,
  onClassClick,
}: FeedbackAdminViewProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando turmas...</p>
      </div>
    );
  }

  if (groupedClasses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          {selectedStyle || selectedClass
            ? "Nenhuma turma encontrada com os filtros aplicados."
            : "Nenhuma turma encontrada."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedClasses.map((turma) => (
        <div
          key={`${turma.classId}-${turma.style}-${turma.date}`}
          className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onClassClick(turma.classId)}
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
                  <div className="flex items-center bg-amber-100 px-2 py-1 rounded-full">
                    <Music className="w-3 h-3 mr-1 text-amber-700" />
                    <span className="text-xs font-medium text-amber-800">
                      {turma.style}
                    </span>
                  </div>
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
