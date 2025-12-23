import { News } from "../types";
import { useState } from "react";

interface NewsCardProps {
  news: News;
  onClick?: () => void;
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <article>
      <div
        onClick={onClick}
        className={`group block bg-white border border-amber-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
          onClick ? "cursor-pointer" : ""
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
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="border-t border-amber-100 mx-6"></div>
          </>
        )}
        <div className={`p-6 ${news.imageUrl && !imageError ? 'pt-6' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <h3 className="text-2xl font-bold tracking-tight text-amber-900 group-hover:text-amber-800 transition-colors line-clamp-2">
              {news.title}
            </h3>
            <span className="text-sm text-gray-500 whitespace-nowrap sm:ml-4">
              {formatDate(news.publishedAt)}
            </span>
          </div>
          {news.author && (
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Por: <span className="text-amber-700">{news.author}</span>
            </p>
          )}
          <p className="font-normal text-gray-700 leading-relaxed line-clamp-3">
            {news.content.length > 200
              ? `${news.content.substring(0, 200)}...`
              : news.content}
          </p>
          {news.content.length > 200 && (
            <div className="mt-4 flex items-center text-amber-900 text-sm font-medium group-hover:text-amber-800 transition-colors">
              <span>Ler mais</span>
              <svg
                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
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
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
