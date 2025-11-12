export interface CnnResponse {
  items: ItemCnn[];
  feedUrl: string;
  image: Image;
  paginationLinks: PaginationLinks;
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
}

export interface ItemCnn {
  title: string;
  link: string;
  pubDate: string;
  "content:encoded": string;
  "content:encodedSnippet": string;
  enclosure: Enclosure;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}

export interface Enclosure {
  length: string;
  type: string;
  url: string;
}

export interface Image {
  link: string;
  url: string;
  title: string;
}

export interface PaginationLinks {
  self: string;
}
