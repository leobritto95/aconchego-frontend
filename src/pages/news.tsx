import { NewsCard } from "../components/news-card";
import { NewsModal } from "../components/news-modal";
import { ConfirmModal } from "../components/confirm-modal";
import { useNews, useDeleteNews } from "../hooks/useNews";
import { useAuth } from "../hooks/useAuth";
import { canManageNews } from "../utils/permissions";
import { useState, useCallback, useMemo } from "react";
import type { News } from "../types";

const NEWS_PER_PAGE = 10;

export function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  
  const { news, isLoading, error, refetch, pagination } = useNews(
    currentPage,
    NEWS_PER_PAGE
  );
  const { user } = useAuth();
  const deleteMutation = useDeleteNews();

  const canManage = useMemo(() => canManageNews(user || null), [user]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreate = useCallback(() => {
    setEditingNews(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((newsItem: News) => {
    setEditingNews(newsItem);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((newsItem: News) => {
    setNewsToDelete(newsItem);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (newsToDelete) {
      deleteMutation.mutate(newsToDelete.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setNewsToDelete(null);
        },
      });
    }
  }, [newsToDelete, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
    setNewsToDelete(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingNews(null);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if (pagination) {
      setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1));
    }
  }, [pagination]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Componentes de estado
  const LoadingState = () => (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando notícias...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-red-600 mb-4 text-lg font-medium">{error}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="w-24 h-24 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
      <p className="text-gray-600 text-lg">Nenhuma notícia encontrada.</p>
      <p className="text-gray-500 text-sm mt-2">
        Quando houver notícias, elas aparecerão aqui.
      </p>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900">Notícias</h1>
          {canManage && (
            <button
              onClick={handleCreate}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-900 text-white rounded-lg hover:bg-amber-800 hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-1.5 sm:gap-2 shadow-md text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Nova Notícia</span>
              <span className="sm:hidden">Nova</span>
            </button>
          )}
        </div>
        {pagination && (
          <p className="text-sm sm:text-base text-gray-600">
            {pagination.total > 0
              ? `${pagination.total} notícia${pagination.total !== 1 ? "s" : ""} encontrada${pagination.total !== 1 ? "s" : ""}`
              : "Nenhuma notícia encontrada"}
          </p>
        )}
      </div>

      {news.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Lista de Notícias */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {news.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onClick={() => {}}
                onEdit={canManage ? handleEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
                canManage={canManage}
              />
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-amber-100">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Página <span className="font-medium text-amber-900">{currentPage}</span> de{" "}
                <span className="font-medium text-amber-900">{pagination.totalPages}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-amber-200 text-amber-900 rounded-lg hover:bg-amber-100 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center gap-1">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                            currentPage === page
                              ? "bg-amber-900 text-white shadow-md scale-105"
                              : "bg-white border border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-amber-200 text-amber-900 rounded-lg hover:bg-amber-100 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Criar/Editar Notícia */}
      {canManage && (
        <NewsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          news={editingNews}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Notícia"
        message={`Tem certeza que deseja excluir a notícia "${newsToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
