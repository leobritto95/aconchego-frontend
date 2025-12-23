import { News } from "../types";
import { useState, useMemo, useCallback } from "react";

interface NewsCardProps {
  news: News;
  onClick?: () => void;
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

export function NewsCard({ news, onClick }: NewsCardProps) {
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
    // Prevenir expansão se clicar em links ou elementos interativos
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.closest("a")) {
      return;
    }

    if (!canExpand) return;

    setIsExpanded((prev) => !prev);
    onClick?.();
  }, [canExpand, onClick]);

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
            <div className="relative w-full bg-white overflow-hidden flex items-center justify-center min-h-[200px] max-h-[500px] px-4 py-6">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                </div>
              )}
              <img
                src={news.imageUrl}
                alt={news.title}
                className={`w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="border-t border-amber-100 mx-6"></div>
          </>
        )}
        <div className={`p-6 ${news.imageUrl && !imageError ? 'pt-6' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <h3 className="text-2xl font-bold tracking-tight text-amber-900 group-hover:text-amber-700 group-hover:underline transition-all duration-200 line-clamp-2">
              {news.title}
            </h3>
            <time 
              dateTime={news.publishedAt}
              className="text-sm text-gray-500 whitespace-nowrap sm:ml-4"
            >
              {formatDate(news.publishedAt)}
            </time>
          </div>
          {news.author && (
            <p className="text-sm text-gray-600 mb-3 font-medium">
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
