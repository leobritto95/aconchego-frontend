import { NewsCard } from "../components/news-card";
import { useNews } from "../hooks/useNews";
import { useState } from "react";

export function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const { news, isLoading, error, refetch, pagination } = useNews(
    currentPage,
    10
  );

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notícias...</p>
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
    <div className="flex flex-col flex-1 items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Notícias</h1>

      {news.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">Nenhuma notícia encontrada.</p>
        </div>
      ) : (
        <>
          <div className="w-full max-w-4xl space-y-4">
            {news.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onClick={() => {
                  // Aqui você pode implementar navegação para detalhes da notícia
                  console.log("Clicou na notícia:", newsItem.id);
                }}
              />
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
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
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 bg-amber-900 text-white rounded disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
