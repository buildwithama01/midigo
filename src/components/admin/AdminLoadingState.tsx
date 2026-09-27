export default function AdminLoadingState({
  label = "Loading admin records",
}: {
  label?: string;
}) {
  return (
    <div aria-busy="true" aria-label={label} className="admin-empty-state">
      <span className="admin-loading-mark" />
      <strong>Loading records</strong>
      <p>{label}</p>
    </div>
  );
}
