export interface TempoResponse {
  items: ItemTempo[];
  title: string;
  description: string;
  link: string;
  language: string;
}

export interface ItemTempo {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  isoDate: string;
}
