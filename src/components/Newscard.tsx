import { Link } from "react-router-dom";

interface NewsCardProps {
  id: number;
  title: string;
  image?: string;
  summary?: string;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  image,
  summary,
  onDelete,
  deleting,
}) => {
  // 🔹 Gambar default kalau tidak ada atau gagal dimuat
  const fallbackImage = "https://via.placeholder.com/600x400?text=No+Image";

  // Pastikan image selalu string agar tidak undefined
  const safeImage =
    typeof image === "string" && image.trim() !== "" ? image : fallbackImage;

  return (
    <div className="relative bg-white shadow rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl group">
      {/* Tombol hapus (opsional) */}
      {onDelete && (
        <button
          onClick={() => onDelete(id)}
          disabled={deleting}
          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Menghapus..." : "Hapus"}
        </button>
      )}

      {/* 🔹 Gunakan fallback kalau gambar tidak ada */}
      <img
        src={safeImage}
        alt={title}
        className="w-full h-48 object-cover bg-gray-200"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallbackImage;
        }}
      />

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h2>
        <p className="text-gray-600 text-sm line-clamp-3">
          {summary && summary.trim() !== ""
            ? summary
            : "Tidak ada ringkasan tersedia."}
        </p>

        <Link
          to={`/detail/${id}`}
          state={{ id, title, image, summary }}
          className="text-blue-600 text-sm font-medium hover:underline mt-2 block"
        >
          Baca selengkapnya →
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
