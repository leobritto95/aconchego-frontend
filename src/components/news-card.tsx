import { News } from "../types";
import { useState, useMemo, useCallback } from "react";

interface NewsCardProps {
  news: News;
  onClick?: () => void;
  onEdit?: (news: News) => void;
  onDelete?: (news: News) => void;
  canManage?: boolean;
}

// Constantes de configuração
const CONTENT_LENGTH_THRESHOLDS = {
  LONG: 200,
  MEDIUM: 100,
} as const;

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Componente para o ícone de expandir/colapsar
interface ExpandIconProps {
  isExpanded: boolean;
  className?: string;
}

function ExpandIcon({ isExpanded, className = "" }: ExpandIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {isExpanded ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      )}
    </svg>
  );
}

// Componente para o botão "Ler mais/menos"
interface ReadMoreButtonProps {
  isExpanded: boolean;
  isMobile?: boolean;
}

function ReadMoreButton({ isExpanded, isMobile = false }: ReadMoreButtonProps) {
  const baseClasses = "mt-4 flex items-center text-amber-900 text-sm font-semibold group-hover:text-amber-700 transition-colors";
  const visibilityClasses = isMobile ? "sm:hidden" : "hidden sm:flex";

  return (
    <div className={`${baseClasses} ${visibilityClasses}`}>
      <span className="group-hover:underline">
        {isExpanded ? "Ler menos" : "Ler mais"}
      </span>
      <ExpandIcon
        isExpanded={isExpanded}
        className={`w-5 h-5 ml-1 transform transition-transform duration-300 ${
          isExpanded ? "rotate-180" : "group-hover:translate-x-2"
        }`}
      />
    </div>
  );
}

export function NewsCard({ news, onClick, onEdit, onDelete, canManage = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoizar cálculos de conteúdo
  const contentInfo = useMemo(() => {
    const length = news.content.length;
    return {
      isLong: length > CONTENT_LENGTH_THRESHOLDS.LONG,
      isMedium: length > CONTENT_LENGTH_THRESHOLDS.MEDIUM && length <= CONTENT_LENGTH_THRESHOLDS.LONG,
      shouldTruncate: length > CONTENT_LENGTH_THRESHOLDS.LONG,
      truncatedContent: length > CONTENT_LENGTH_THRESHOLDS.LONG 
        ? `${news.content.substring(0, CONTENT_LENGTH_THRESHOLDS.LONG)}...`
        : news.content,
    };
  }, [news.content]);

  const canExpand = contentInfo.isLong || contentInfo.isMedium;

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "A" ||
      target.closest("a") ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("[data-action]")
    ) {
      return;
    }

    if (!canExpand) return;

    setIsExpanded((prev) => !prev);
    onClick?.();
  }, [canExpand, onClick]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(news);
  }, [news, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(news);
  }, [news, onDelete]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  return (
    <article>
      <div
        onClick={handleCardClick}
        className={`group block bg-white border border-amber-100 rounded-xl shadow-md hover:shadow-2xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
          canExpand ? "cursor-pointer" : ""
        }`}
      >
          {news.imageUrl && !imageError && (
          <>
            <div className="relative w-full bg-white overflow-hidden flex items-center justify-center min-h-[150px] sm:min-h-[200px] max-h-[400px] sm:max-h-[500px] px-3 py-4 sm:px-4 sm:py-6">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                </div>
              )}
              <img
                src={news.imageUrl}
                alt={news.title}
                className={`w-full h-auto max-h-[400px] sm:max-h-[500px] object-contain transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="border-t border-amber-100 mx-4 sm:mx-6"></div>
          </>
        )}
        <div className={`p-4 sm:p-6 ${news.imageUrl && !imageError ? 'pt-4 sm:pt-6' : ''}`}>
          <div className="flex flex-col gap-2 sm:gap-3 mb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-900 group-hover:text-amber-700 group-hover:underline transition-all duration-200 line-clamp-2 flex-1">
                {news.title}
              </h3>
              {canManage && (
                <div className="flex items-center gap-1 flex-shrink-0" data-action>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 sm:p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-all hover:shadow-sm group/edit"
                    title="Editar notícia"
                    data-action
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover/edit:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm group/delete"
                    title="Deletar notícia"
                    data-action
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 group-hover/delete:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <time 
                dateTime={news.publishedAt}
                className="text-xs sm:text-sm text-gray-500"
              >
                {formatDate(news.publishedAt)}
              </time>
            </div>
          </div>
          {news.author && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium">
              Por: <span className="text-amber-700">{news.author}</span>
            </p>
          )}
          <p 
            className={`font-normal text-gray-700 leading-relaxed transition-all duration-300 ${
              !isExpanded && canExpand ? "line-clamp-3" : ""
            }`}
          >
            {isExpanded ? news.content : contentInfo.truncatedContent}
          </p>
          
          {/* Botão "Ler mais/menos" para desktop */}
          {contentInfo.isLong && (
            <ReadMoreButton isExpanded={isExpanded} isMobile={false} />
          )}
          
          {/* Botão "Ler mais/menos" para mobile */}
          {canExpand && (
            <ReadMoreButton isExpanded={isExpanded} isMobile={true} />
          )}
        </div>
      </div>
    </article>
  );
}
