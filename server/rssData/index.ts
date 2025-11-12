import Parser from "rss-parser";
import { ItemTempo, TempoResponse } from "../types/tempo.rss.type";
import { ItemCnn, CnnResponse } from "../types/cnn.rss.type";

const sources = {
  tempo: "https://rss.tempo.co/",
  cnn: "https://www.cnnindonesia.com/rss",
};

const parser = new Parser<
  TempoResponse | CnnResponse,
  ItemTempo | ItemCnn
>({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["content:encodedSnippet", "contentEncodedSnippet"],
      ["enclosure", "enclosure"],
    ],
  },
});

export const rssParser = async ({ source }: { source: "cnn" | "tempo"; }) => {
  const feed = await parser.parseURL(sources[source]);

  const news = feed.items.map((item) => ({
    title: item.title,
    link: item.link,
    date: item.pubDate,
    ...(source === "cnn"
      ? {
        image: (item as ItemCnn).enclosure?.url,
        snippet: (item as ItemCnn).contentSnippet,
      }
      : {
        snippet: (item as ItemTempo).contentSnippet,
      }),
  }));
  console.table(news.slice(0, 3).map((item) => ({
    date: item.date,
    link: item.link.slice(0, 10),
    title: item.title
  })));

  return news;
};