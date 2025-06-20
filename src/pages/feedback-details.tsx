import { Textarea } from "@headlessui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useFeedbackById } from "../hooks/useFeedback";
import { useAuth } from "../hooks/useAuth";
import { canViewFeedback, canViewAllFeedbacks } from "../utils/permissions";
import { getStudentName } from "../services/studentUtils";

export function FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { feedback, isLoading, error } = useFeedbackById(
    feedbackId ? parseInt(feedbackId) : 0
  );

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate("/feedback");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
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

  if (!feedback) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Feedback não encontrado.</p>
        </div>
      </div>
    );
  }

  // Verifica permissões para visualizar o feedback
  if (!canViewFeedback(user || null, feedback.studentId)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Acesso negado. Você não tem permissão para visualizar este feedback.
          </p>
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

  const average = feedback.average;
  const isApproved = feedback.status === "approved";
  const isAdmin = user && canViewAllFeedbacks(user);

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">
          {feedback.style} / {feedback.class}
        </h1>

        {/* Informações do aluno para admin */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Informações do Aluno
            </h3>
            <p className="text-gray-600">
              <strong>Nome:</strong> {getStudentName(feedback.studentId)}
            </p>
            <p className="text-gray-600">
              <strong>Data:</strong>{" "}
              {new Date(feedback.date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}

        <div className="w-full text-center h-full flex flex-col justify-center">
          <div className="w-96 m-4 text-center bg-gray-100 border border-gray-400 rounded-lg mx-auto pt-4 shadow-md">
            <h2 className="text-xl font-semibold pb-2">Média avaliadores</h2>
            {feedback.parameters && (
              <div className="flex flex-col">
                <span>Parâmetro 1: {feedback.parameters.parameter1}</span>
                <span>Parâmetro 2: {feedback.parameters.parameter2}</span>
                <span>Parâmetro 3: {feedback.parameters.parameter3}</span>
                <span>Parâmetro 4: {feedback.parameters.parameter4}</span>
                <span>Parâmetro 5: {feedback.parameters.parameter5}</span>
              </div>
            )}
            <div className="pt-2">
              <span className="text-lg">Média: {average.toFixed(1)}</span>
            </div>
            <div className="pt-2">
              <span
                className={`text-lg ${
                  isApproved ? "text-green-600" : "text-red-600"
                }`}
              >
                Status: {isApproved ? "Aprovado" : "Reprovado"}
              </span>
            </div>
            <div className="m-4 flex flex-col">
              <span className="text-base font-semibold">
                Feedback do avaliador
              </span>
              <Textarea
                className="min-h-20 mt-2 bg-gray-100 border border-gray-400 rounded-lg p-3 text-center"
                name="description"
                value={
                  feedback.evaluatorFeedback || "Nenhum feedback disponível"
                }
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
