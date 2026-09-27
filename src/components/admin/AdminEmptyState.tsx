export default function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="admin-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
