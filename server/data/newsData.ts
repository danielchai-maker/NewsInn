export interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
}

export const newsData: NewsItem[] = [];
