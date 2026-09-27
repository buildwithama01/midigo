export default function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "4rem 2rem",
        border: "1px dashed var(--border-mid)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", fontWeight: 300 }}>
        {message}
      </p>
    </div>
  );
}
