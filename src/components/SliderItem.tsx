import { useNavigate } from "react-router-dom";

interface SliderItemProps {
  id: string;
  title: string;
  image?: string;
  summary?: string;
  category?: string;
  date?: string;
}

export default function SliderItem({ id, title, image }: SliderItemProps) {
  const navigate = useNavigate();
  const safeImg = image && image.trim() !== "" ? image : "/no-image.png";

  return (
    <div
      onClick={() =>
        navigate(`/detail/${encodeURIComponent(id)}`, {
          state: { id, title, image },
        })
      }
      className="
        relative w-full h-120
        rounded-xl overflow-hidden cursor-pointer
        group shadow-md transition-all duration-300
      "
    >
      <img
        src={safeImg}
        alt={title}
        loading="lazy"
        onError={(e) => (e.currentTarget.src = "/no-image.png")}
        className="
          w-full h-full object-cover
          transition-transform duration-500
          group-hover:scale-110 group-hover:brightness-90
        "
      />

      <div
        className="
          absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-black/70 to-black/0
          text-white text-sm font-semibold p-3
        "
      >
        {title}
      </div>
    </div>
  );
}
