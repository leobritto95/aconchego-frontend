import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFeedback, useFilterOptions } from "../hooks/useFeedback";
import { useState } from "react";

export function Feedback() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Usando os hooks refatorados
  const { feedbacks, isLoading, error, refetch, pagination } = useFeedback(
    currentPage,
    10,
    selectedStyle || undefined,
    undefined, // classFilter
    selectedYear || undefined
  );

  const {
    styles,
    classes,
    years,
    isLoading: isLoadingFilters,
  } = useFilterOptions();

  function goToFeedbackDetails(feedbackId: number) {
    navigate(`/feedback/${feedbackId}`);
  }

  const handleStyleFilter = (style: string) => {
    setSelectedStyle(style);
    setCurrentPage(1); // Reset para primeira página
  };

  const handleYearFilter = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1); // Reset para primeira página
  };

  const handleRetry = () => {
    refetch();
  };

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

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">
        Histórico de Feedbacks
      </h1>

      <div className="p-4 w-full max-w-4xl">
        <div className="mb-4">
          <span className="text-base font-semibold">Estilos</span>
          <select
            value={selectedStyle}
            onChange={(e) => handleStyleFilter(e.target.value)}
            className="ml-2 px-3 py-1 border border-gray-300 rounded-md"
            disabled={isLoadingFilters}
          >
            <option value="">Todos</option>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <span className="text-base font-semibold">Ano</span>
          <select
            value={selectedYear}
            onChange={(e) => handleYearFilter(e.target.value)}
            className="ml-2 px-3 py-1 border border-gray-300 rounded-md"
            disabled={isLoadingFilters}
          >
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mb-4 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-amber-900 text-white rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {currentPage} de {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 bg-amber-900 text-white rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl p-4 text-center">
        {feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum feedback encontrado.</p>
          </div>
        ) : (
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
                  onClick={() => goToFeedbackDetails(feedback.id)}
                >
                  <td className="border border-slate-700 p-2">
                    {feedback.style}
                  </td>
                  <td className="border border-slate-700">{feedback.class}</td>
                  <td className="border border-slate-700">
                    {new Date(feedback.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="border border-slate-700">{feedback.grade}</td>
                  <td className="border border-slate-700">
                    {feedback.status === "approved" ? (
                      <Check className="text-green-600 mx-auto" />
                    ) : (
                      <X className="text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
