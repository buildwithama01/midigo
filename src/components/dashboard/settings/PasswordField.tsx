type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: "current-password" | "new-password";
  statusId?: string;
};

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  statusId,
}: PasswordFieldProps) {
  return (
    <div className="settings-field">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="settings-password-input">
        <input
          id={id}
          className="form-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-describedby={statusId}
        />
        <button
          type="button"
          className="settings-password-toggle"
          onClick={onToggleShow}
          aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
