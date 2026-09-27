export default function CategoryNav({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}) {
  const categories = ["All", "Photos", "Videos", "Audio", "Documents", "Other"];

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        borderBottom: "1px solid var(--border)",
        marginBottom: "3rem",
        overflowX: "auto",
        whiteSpace: "nowrap",
        paddingBottom: "1px",
      }}
    >
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            padding: "0.75rem 0",
            color: activeCategory === cat ? "var(--purple)" : "var(--text-secondary)",
            borderBottom: activeCategory === cat ? "2px solid var(--purple)" : "2px solid transparent",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
            fontFamily: "inherit",
          }}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
}
