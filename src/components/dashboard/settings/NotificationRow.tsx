type NotificationRowProps = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function NotificationRow({
  id,
  title,
  description,
  checked,
  onChange,
}: NotificationRowProps) {
  return (
    <label className="settings-notification-row" htmlFor={id}>
      <span className="settings-notification-copy">
        <span className="settings-notification-title">{title}</span>
        <span className="settings-notification-description">{description}</span>
      </span>
      <input
        id={id}
        type="checkbox"
        className="settings-toggle-input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="settings-toggle-control" aria-hidden="true" />
    </label>
  );
}
