import Image from "next/image";
import { IoLockClosedOutline } from "react-icons/io5";
import { MediaItem } from "./MediaLightbox";

export default function MasonryGallery({
  items,
  onOpenMedia,
}: {
  items: MediaItem[];
  onOpenMedia: (item: MediaItem) => void;
}) {
  return (
    <div className="masonry-gallery">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpenMedia(item)}
          className="masonry-item"
          aria-label={`View ${item.title}`}
          style={{
            background: "var(--surface)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3/4",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
              background: "var(--surface-2)",
            }}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              style={{
                objectFit: "cover",
                filter: item.locked ? "blur(12px) brightness(0.6)" : "none",
                transition: "transform 0.5s ease",
              }}
              className="gallery-img"
            />
            {item.locked && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "0.5rem",
                  background: "var(--overlay-soft)",
                }}
              >
                <div style={{ padding: "0.5rem", background: "var(--purple)", borderRadius: "50%", color: "var(--on-accent)" }}>
                  <IoLockClosedOutline size={16} />
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>VIP</span>
              </div>
            )}
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {item.category} &bull; {item.date}
            </p>
          </div>
        </button>
      ))}
      <style>{`
        .masonry-gallery {
          column-count: 2;
          column-gap: 1.5rem;
        }
        .masonry-item {
          break-inside: avoid;
        }
        .masonry-item:hover .gallery-img {
          transform: scale(1.05);
        }
        @media (min-width: 768px) {
          .masonry-gallery { column-count: 3; }
        }
        @media (min-width: 1200px) {
          .masonry-gallery { column-count: 4; }
        }
      `}</style>
    </div>
  );
}
