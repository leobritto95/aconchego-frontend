import { Check, X, Clock, ArrowLeft, Users, Calendar, Music } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFeedbacksByClassId } from "../hooks/useFeedback";
import { StudentName } from "../components/student-name";

export function ClassFeedbacks() {
  const navigate = useNavigate();
  const { classId } = useParams();

  const { feedbacks, isLoading, error, refetch } = useFeedbacksByClassId(
    classId || ""
  );

  const getClassInfo = () => {
    if (feedbacks.length > 0) {
      const firstFeedback = feedbacks[0];
      return {
        name: firstFeedback.class,
        style: firstFeedback.style,
        date: firstFeedback.date,
      };
    }
    return null;
  };

  const classInfo = getClassInfo();

  const handleRetry = () => {
    refetch();
  };

  const handleGoBack = () => {
    navigate("/feedback");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando feedbacks da turma...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Turma não encontrada.</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl p-4">
        {/* Header com botão voltar */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-amber-900 hover:text-amber-800 mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-amber-900">Feedbacks</h1>
        </div>

        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {classInfo.name}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <Music className="w-4 h-4 mr-2 text-amber-900" />
                  <span>{classInfo.style}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-amber-900" />
                  <span>
                    {new Date(classInfo.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de feedbacks</p>
              <p className="text-2xl font-bold text-amber-900">
                {feedbacks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                Nenhum feedback encontrado para esta turma.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Média
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/feedback/${feedback.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        <StudentName studentId={feedback.studentId} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-800">
                        {feedback.average.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {feedback.status === "approved" ? (
                        <div className="flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : feedback.status === "pending" ? (
                        <div className="flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <X className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
