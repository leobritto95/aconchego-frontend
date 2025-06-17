import { News } from "../types";

interface NewsCardProps {
  news: News;
  onClick?: () => void;
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <div
        onClick={onClick}
        className={`block p-6 bg-white border border-amber-100 rounded-lg shadow hover:bg-amber-50 transition-colors ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-2xl font-bold tracking-tight text-amber-900">
            {news.title}
          </h5>
          <span className="text-sm text-gray-500 ml-4">
            {formatDate(news.publishedAt)}
          </span>
        </div>
        {news.author && (
          <p className="text-sm text-gray-600 mb-3">Por: {news.author}</p>
        )}
        <p className="font-normal text-gray-700">
          {news.content.length > 200
            ? `${news.content.substring(0, 200)}...`
            : news.content}
        </p>
        {news.content.length > 200 && (
          <p className="text-amber-900 text-sm font-medium mt-2">Ler mais →</p>
        )}
      </div>
    </div>
  );
}
