export interface NewsItem {
  id: number;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
  link: string;
}

export const newsData: NewsItem[] = [];
