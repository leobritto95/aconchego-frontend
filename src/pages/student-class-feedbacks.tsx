import { useParams, useNavigate } from "react-router-dom";
import { useFeedback } from "../hooks/useFeedback";
import { Feedback } from "../types";
import { ArrowLeft, Music, Check, X, Clock, Calendar } from "lucide-react";
import { getCurrentUserId } from "../utils/permissions";

// Componente para exibir um feedback individual
function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      onClick={() => navigate(`/feedback/${feedback.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-sm text-gray-600">Data</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(feedback.date).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Nota</p>
          <p className="text-xl font-bold text-amber-900">
            {feedback.average.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Status</p>
          {feedback.status === "approved" ? (
            <div className="flex items-center justify-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">Aprovado</span>
            </div>
          ) : feedback.status === "pending" ? (
            <div className="flex items-center justify-center text-yellow-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">Pendente</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-red-600">
              <X className="w-4 h-4 mr-1" />
              <span className="text-sm">Reprovado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentClassFeedbacksPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  // Busca todos os feedbacks do aluno para essa turma
  const { feedbacks, isLoading, error } = useFeedback(
    1, // página
    100, // limite alto para pegar todos
    undefined, // style
    undefined, // classFilter
    undefined, // startDate
    undefined // endDate
  );

  // Filtra apenas os feedbacks da turma específica e do aluno logado
  // Compara como string para evitar problemas com ObjectIds
  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      String(f.classId) === String(classId) && f.studentId === currentUserId
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erro ao carregar feedbacks: {error}
          </p>
          <button
            onClick={() => navigate("/feedback")}
            className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (filteredFeedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl p-4">
          <button
            onClick={() => navigate("/feedback")}
            className="flex items-center text-amber-900 hover:text-amber-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar aos feedbacks
          </button>

          <div className="text-center py-8">
            <p className="text-gray-600">
              Nenhum feedback encontrado para esta turma.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Obtém informações da turma do primeiro feedback
  const getClassInfo = () => {
    if (filteredFeedbacks.length > 0) {
      const firstFeedback = filteredFeedbacks[0];
      return {
        name: firstFeedback.class,
        style: firstFeedback.style,
        date: firstFeedback.date,
      };
    }
    return null;
  };

  const classInfo = getClassInfo();

  if (!classInfo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Informações da turma não encontradas.
          </p>
          <button
            onClick={() => navigate("/feedback")}
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
            onClick={() => navigate("/feedback")}
            className="flex items-center text-amber-900 hover:text-amber-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-amber-900">Meus Feedbacks</h1>
        </div>

        {/* Informações da turma */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {classInfo.name}
              </h2>
              <div className="flex items-center gap-4 text-gray-600 mt-1">
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
                {filteredFeedbacks.length}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de feedbacks */}
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>
    </div>
  );
}
