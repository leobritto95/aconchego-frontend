import { NewsCard } from "../components/news-card";

export function News() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-2">
      <NewsCard />
      <NewsCard />
      <NewsCard />
    </div>
  );
}
