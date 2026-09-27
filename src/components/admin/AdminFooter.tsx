export default function AdminFooter({ label = "Last updated just now" }: { label?: string }) {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-inner">
        <strong>Midigo Admin</strong>
        <span>{label}</span>
      </div>
    </footer>
  );
}
